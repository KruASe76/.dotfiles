import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Meta from 'gi://Meta';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const showBannersSetting = "show-banners";
const schemaId = "org.gnome.desktop.notifications";

class DoNotDisturbManager {
    constructor() {
        this._settings = null;
    }

    getSettings() {
        if (!this._settings) {
            this._settings = new Gio.Settings({ schema_id: schemaId });
        }

        return this._settings;
    }

    turnDndOn() {
        this.getSettings().set_boolean(showBannersSetting, false);
    }

    turnDndOff() {
        this.getSettings().set_boolean(showBannersSetting, true);
    }

    dispose() {
        this._settings = null;
    }
}

class ScreenRecordingNotifier {
    subscribe(handler) {
        return Main.screenshotUI.connect("notify::screencast-in-progress", () => {
            const status = Main.screenshotUI.screencast_in_progress
                ? ScreenRecordingStatus.recording
                : ScreenRecordingStatus.notRecording;
            handler(status);
        });
    }

    unsubscribe(subscriptionId) {
        Main.screenshotUI.disconnect(subscriptionId);
    }
}
var ScreenRecordingStatus;
(function (ScreenRecordingStatus) {
    ScreenRecordingStatus[ScreenRecordingStatus["recording"] = 0] = "recording";
    ScreenRecordingStatus[ScreenRecordingStatus["notRecording"] = 1] = "notRecording";
})(ScreenRecordingStatus || (ScreenRecordingStatus = {}));

class ScreenSharingNotifier {
    constructor() {
        this._handles = new Map();
    }

    subscribe(handler) {
        if (!Meta.is_wayland_compositor()) {
            console.warn('"Do Not Disturb While Screen Sharing or Recording" extension does not support compositors other than Wayland. Subscription will not be created. If you\'re using X11 exlusively, disable or remove this extension since it will not work anyway.');

            return null;
        }
        this._controller = global.backend.get_remote_access_controller();
        if (!this._controller) {
            console.warn("Subscription to screen sharing status failed, the remote access controller cannot be retrieved");

            return null;
        }

        return this._controller.connect("new-handle", (_, handle) => {
            if (handle.is_recording) {
                return;
            }
            const stopId = handle.connect("stopped", () => {
                handle.disconnect(stopId);
                this._handles.delete(stopId);
                if (this._handles.size === 0) {
                    handler(ScreenSharingStatus.notSharing);
                }
            });
            handler(ScreenSharingStatus.sharing);
            this._handles.set(stopId, handle);
        });
    }

    unsubscribe(subscriptionId) {
        this._controller?.disconnect(subscriptionId);
        for (const handlePair of this._handles) {
            handlePair[1].disconnect(handlePair[0]);
        }
    }
}
var ScreenSharingStatus;
(function (ScreenSharingStatus) {
    ScreenSharingStatus[ScreenSharingStatus["sharing"] = 0] = "sharing";
    ScreenSharingStatus[ScreenSharingStatus["notSharing"] = 1] = "notSharing";
})(ScreenSharingStatus || (ScreenSharingStatus = {}));

const SettingsPath = "org.gnome.shell.extensions.do-not-disturb-while-screen-sharing-or-recording";
const DoNotDisturbOnScreenSharingSetting = "dnd-on-screen-sharing";
const DoNotDisturbOnScreenRecordingSetting = "dnd-on-screen-recording";
const IsWaylandSetting = "is-wayland";

class SettingsManager {
    constructor(settings) {
        this.settings = settings;
    }

    getShouldDndOnScreenSharing() {
        return this.settings.get_boolean(DoNotDisturbOnScreenSharingSetting);
    }

    setShouldDndOnScreenSharing(value) {
        this.settings.set_boolean(DoNotDisturbOnScreenSharingSetting, value);
    }

    getShouldDndOnScreenRecording() {
        return this.settings.get_boolean(DoNotDisturbOnScreenRecordingSetting);
    }

    setShouldDndOnScreenRecording(value) {
        this.settings.set_boolean(DoNotDisturbOnScreenRecordingSetting, value);
    }

    getIsWayland() {
        return this.settings.get_boolean(IsWaylandSetting);
    }

    setIsWayland(value) {
        this.settings.set_boolean(IsWaylandSetting, value);
    }

    connectToChanges(settingName, func) {
        return this.settings.connect(`changed::${settingName}`, func);
    }

    disconnect(subscriptionId) {
        this.settings.disconnect(subscriptionId);
    }
}

class DoNotDisturbWhileScreenSharingOrRecordingExtension extends Extension {
    constructor() {
        super(...arguments);
        this._settings = null;
        this._settingsSubscription = null;
        this._dndManager = null;
    }

    enable() {
        console.log(`Enabling extension ${this.uuid}`);
        this._settings = new SettingsManager(this.getSettings(SettingsPath));
        this.checkCompositor();
        this._screenRecordingNotifier = new ScreenRecordingNotifier();
        this._screenSharingNotifier = new ScreenSharingNotifier();
        this._dndManager = new DoNotDisturbManager();
        this._screenRecordingSubId = this._screenRecordingNotifier.subscribe(this.handleScreenRecording.bind(this));
        this._screenSharingSubId = this._screenSharingNotifier.subscribe(this.handleScreenSharing.bind(this));
    }

    checkCompositor() {
        if (!Meta.is_wayland_compositor()) {
            this._settings?.setIsWayland(false);
        }
        else {
            this._settings?.setIsWayland(true);
        }
    }

    handleScreenSharing(status) {
        if (!this._settings?.getShouldDndOnScreenSharing()) {
            return;
        }
        if (status === ScreenSharingStatus.sharing) {
            this._dndManager?.turnDndOn();
        }
        else {
            this._dndManager?.turnDndOff();
        }
    }

    handleScreenRecording(status) {
        if (!this._settings?.getShouldDndOnScreenRecording()) {
            return;
        }
        if (status === ScreenRecordingStatus.recording) {
            this._dndManager?.turnDndOn();
        }
        else {
            this._dndManager?.turnDndOff();
        }
    }

    disable() {
        console.log(`Disabling extension ${this.uuid}`);
        if (this._settingsSubscription) {
            this._settings?.disconnect(this._settingsSubscription);
            this._settingsSubscription = null;
        }
        if (this._screenRecordingSubId) {
            this._screenRecordingNotifier?.unsubscribe(this._screenRecordingSubId);
            this._screenRecordingSubId = null;
        }
        this._screenRecordingNotifier = null;
        if (this._screenSharingSubId) {
            this._screenSharingNotifier?.unsubscribe(this._screenSharingSubId);
            this._screenSharingSubId = null;
        }
        this._screenSharingNotifier = null;
        this._dndManager?.dispose();
        this._dndManager = null;
        this._settings = null;
    }
}

export { DoNotDisturbWhileScreenSharingOrRecordingExtension as default };
