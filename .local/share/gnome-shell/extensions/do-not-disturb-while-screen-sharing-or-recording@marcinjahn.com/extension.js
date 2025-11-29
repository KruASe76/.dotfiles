import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GLib from 'gi://GLib';

const showBannersSetting = "show-banners";
const schemaId = "org.gnome.desktop.notifications";

class DoNotDisturbManager {
    constructor() {
        this._settings = null;
        this._previousShowBanners = null;
    }

    getSettings() {
        if (!this._settings) {
            this._settings = new Gio.Settings({ schema_id: schemaId });
        }

        return this._settings;
    }

    turnDndOn() {
        const settings = this.getSettings();
        if (this._previousShowBanners === null) {
            this._previousShowBanners = settings.get_boolean(showBannersSetting);
        }
        settings.set_boolean(showBannersSetting, false);
    }

    turnDndOff() {
        if (this._previousShowBanners === null) {
            return;
        }
        this.getSettings().set_boolean(showBannersSetting, this._previousShowBanners);
        this._previousShowBanners = null;
    }

    dispose() {
        this.turnDndOff();
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

class FullscreenNotifier {
    constructor() {
        this._display = null;
    }

    subscribe(handler) {
        this._display = global.display;
        if (!this._display) {
            console.warn("Subscription to fullscreen status failed, the display cannot be retrieved");

            return null;
        }

        return this._display.connect("in-fullscreen-changed", () => {
            handler(this.isAnyMonitorFullscreen()
                ? FullscreenStatus.fullscreen
                : FullscreenStatus.notFullscreen);
        });
    }

    isAnyMonitorFullscreen() {
        if (!this._display) {
            return false;
        }
        const monitorsCount = this._display.get_n_monitors();
        for (let i = 0; i < monitorsCount; i++) {
            if (this._display.get_monitor_in_fullscreen(i)) {
                return true;
            }
        }

        return false;
    }

    unsubscribe(subscriptionId) {
        this._display?.disconnect(subscriptionId);
    }
}
var FullscreenStatus;
(function (FullscreenStatus) {
    FullscreenStatus[FullscreenStatus["fullscreen"] = 0] = "fullscreen";
    FullscreenStatus[FullscreenStatus["notFullscreen"] = 1] = "notFullscreen";
})(FullscreenStatus || (FullscreenStatus = {}));

class AppListNotifier {
    constructor() {
        this._display = null;
        this._getAppsList = null;
        this._pendingWindows = new Map();
        this._trackedWindows = new Map();
    }

    subscribe(getAppsList, handler) {
        this._display = global.display;
        this._getAppsList = getAppsList;
        if (!this._display) {
            console.warn("Subscription to applications list status failed, the display cannot be retrieved");

            return null;
        }

        return this._display.connect("window-created", (_, window) => {
            this.trackWindow(window, handler);
        });
    }

    /**
     * WM_CLASS (from the Wayland app_id) isn't always available yet when
     * "window-created" fires - the app_id arrives asynchronously shortly
     * after, unlike X11 clients where WM_CLASS is set synchronously. This
     * affects any toolkit (GTK, Qt, games, etc.), so we also react to the
     * identifiers becoming available/changing before giving up on the window.
     */
    trackWindow(window, handler) {
        let pendingSignalIds = [];
        let unmanagingId = null;
        let matched = false;
        const disconnectPendingSignals = () => {
            for (const id of pendingSignalIds) {
                window.disconnect(id);
            }
            pendingSignalIds = [];
            this._pendingWindows.delete(window);
        };
        const registerMatch = () => {
            if (matched) {
                return;
            }
            matched = true;
            disconnectPendingSignals();
            unmanagingId = window.connect("unmanaging", () => {
                window.disconnect(unmanagingId);
                this._trackedWindows.delete(unmanagingId);
                if (this._trackedWindows.size === 0) {
                    handler(AppListStatus.notRunning);
                }
            });
            this._trackedWindows.set(unmanagingId, window);
            handler(AppListStatus.running);
        };
        if (this.matchesAppsList(window)) {
            registerMatch();

            return;
        }
        const tryMatch = () => {
            if (this.matchesAppsList(window)) {
                registerMatch();
            }
        };
        pendingSignalIds.push(window.connect("notify::wm-class", tryMatch));
        pendingSignalIds.push(window.connect("notify::gtk-application-id", tryMatch));
        const cleanupUnmanagingId = window.connect("unmanaging", () => {
            disconnectPendingSignals();
        });
        pendingSignalIds.push(cleanupUnmanagingId);
        this._pendingWindows.set(window, pendingSignalIds);
    }

    matchesAppsList(window) {
        const identifiers = [
            window.get_wm_class(),
            window.get_wm_class_instance(),
            window.get_gtk_application_id(),
            window.get_sandboxed_app_id(),
        ]
            .filter((id) => !!id)
            .map((id) => id.trim().toLowerCase());
        if (identifiers.length === 0) {
            return false;
        }
        const appsList = this._getAppsList?.() ?? [];

        return appsList.some((app) => {
            const normalizedApp = app.trim().toLowerCase();

            return identifiers.includes(normalizedApp);
        });
    }

    unsubscribe(subscriptionId) {
        this._display?.disconnect(subscriptionId);
        for (const [window, signalIds] of this._pendingWindows) {
            for (const id of signalIds) {
                window.disconnect(id);
            }
        }
        this._pendingWindows.clear();
        for (const [unmanagingId, window] of this._trackedWindows) {
            window.disconnect(unmanagingId);
        }
        this._trackedWindows.clear();
    }
}
var AppListStatus;
(function (AppListStatus) {
    AppListStatus[AppListStatus["running"] = 0] = "running";
    AppListStatus[AppListStatus["notRunning"] = 1] = "notRunning";
})(AppListStatus || (AppListStatus = {}));

Gio._promisify(Gio.File.prototype, "query_info_async", "query_info_finish");
Gio._promisify(Gio.File.prototype, "load_contents_async", "load_contents_finish");

class DirectoryListNotifier {
    constructor() {
        this._display = null;
        this._getDirectoriesList = null;
        this._pendingWindows = new Map();
        this._trackedWindows = new Map();
        this._active = false;
    }

    subscribe(getDirectoriesList, handler) {
        this._display = global.display;
        this._getDirectoriesList = getDirectoriesList;
        this._active = true;
        if (!this._display) {
            this._active = false;
            console.warn("Subscription to directories list status failed, the display cannot be retrieved");

            return null;
        }

        return this._display.connect("window-created", (_, window) => {
            void this.trackWindow(window, handler);
        });
    }

    async trackWindow(window, handler) {
        let unmanaged = false;
        const unmanagingId = window.connect("unmanaging", () => {
            unmanaged = true;
            window.disconnect(unmanagingId);
            this._pendingWindows.delete(unmanagingId);
            if (this._trackedWindows.delete(unmanagingId) &&
                this._trackedWindows.size === 0) {
                handler(DirectoryListStatus.notRunning);
            }
        });
        this._pendingWindows.set(unmanagingId, window);
        const matches = await this.matchesDirectoriesList(window);
        if (unmanaged || !this._active) {
            return;
        }
        this._pendingWindows.delete(unmanagingId);
        if (!matches) {
            window.disconnect(unmanagingId);

            return;
        }
        this._trackedWindows.set(unmanagingId, window);
        handler(DirectoryListStatus.running);
    }

    async matchesDirectoriesList(window) {
        const directories = (this._getDirectoriesList?.() ?? [])
            .map((dir) => this.normalizeDirectory(dir))
            .filter((dir) => !!dir);
        if (directories.length === 0) {
            return false;
        }
        const pid = window.get_pid();
        if (!pid || pid <= 0) {
            return false;
        }
        const candidates = await this.getProcessCandidates(pid);

        return candidates.some((candidate) => directories.some((dir) => candidate.startsWith(dir)));
    }

    /**
     * Collects paths that could reveal where a process is running from: the
     * resolved executable path (via /proc/<pid>/exe), and every command line
     * argument (via /proc/<pid>/cmdline). The latter is needed for Wine/Proton
     * games, whose /proc/<pid>/exe points at the Wine loader binary rather
     * than the actual game's .exe - the real path is only visible as a
     * command line argument, often using a Windows-style drive letter and
     * backslashes, so a normalized (forward-slash, no drive letter) variant
     * of each candidate is also included.
     */
    async getProcessCandidates(pid) {
        const candidates = [];
        const [exePath, cmdlineArgs] = await Promise.all([
            this.resolveExePath(pid),
            this.readCmdlineArgs(pid),
        ]);
        if (exePath) {
            candidates.push(exePath);
        }
        candidates.push(...cmdlineArgs);
        const normalizedVariants = candidates
            .map((candidate) => this.normalizeWineStylePath(candidate))
            .filter((candidate) => !!candidate);

        return [...candidates, ...normalizedVariants].map((candidate) => candidate.toLowerCase());
    }

    async resolveExePath(pid) {
        try {
            const file = Gio.File.new_for_path(`/proc/${pid}/exe`);
            const info = await file.query_info_async(Gio.FILE_ATTRIBUTE_STANDARD_SYMLINK_TARGET, Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, 0, null);

            return info.get_symlink_target();
        }
        catch {
            return null;
        }
    }

    async readCmdlineArgs(pid) {
        try {
            const file = Gio.File.new_for_path(`/proc/${pid}/cmdline`);
            const [contents] = await file.load_contents_async(null);
            const decoder = new TextDecoder("utf-8");

            return decoder
                .decode(contents)
                .split("\0")
                .filter((arg) => arg.length > 0);
        }
        catch {
            return [];
        }
    }

    normalizeWineStylePath(value) {
        if (!value.includes("\\")) {
            return null;
        }

        return value.replace(/\\/g, "/").replace(/^[a-zA-Z]:/, "");
    }

    normalizeDirectory(rawDirectory) {
        let directory = rawDirectory.trim();
        if (!directory) {
            return null;
        }
        if (directory === "~" || directory.startsWith("~/")) {
            directory = GLib.get_home_dir() + directory.slice(1);
        }
        if (!directory.endsWith("/")) {
            directory += "/";
        }

        return directory.toLowerCase();
    }

    unsubscribe(subscriptionId) {
        this._active = false;
        this._display?.disconnect(subscriptionId);
        for (const [unmanagingId, window] of this._pendingWindows) {
            window.disconnect(unmanagingId);
        }
        this._pendingWindows.clear();
        for (const [unmanagingId, window] of this._trackedWindows) {
            window.disconnect(unmanagingId);
        }
        this._trackedWindows.clear();
    }
}
var DirectoryListStatus;
(function (DirectoryListStatus) {
    DirectoryListStatus[DirectoryListStatus["running"] = 0] = "running";
    DirectoryListStatus[DirectoryListStatus["notRunning"] = 1] = "notRunning";
})(DirectoryListStatus || (DirectoryListStatus = {}));

const SettingsPath = "org.gnome.shell.extensions.do-not-disturb-while-screen-sharing-or-recording";
const DoNotDisturbOnScreenSharingSetting = "dnd-on-screen-sharing";
const DoNotDisturbOnScreenRecordingSetting = "dnd-on-screen-recording";
const DoNotDisturbOnFullscreenSetting = "dnd-on-fullscreen";
const DoNotDisturbOnAppsListSetting = "dnd-on-apps-list";
const DoNotDisturbAppsListSetting = "dnd-apps-list";
const DoNotDisturbOnDirectoriesListSetting = "dnd-on-directories-list";
const DoNotDisturbDirectoriesListSetting = "dnd-directories-list";

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

    getShouldDndOnFullscreen() {
        return this.settings.get_boolean(DoNotDisturbOnFullscreenSetting);
    }

    setShouldDndOnFullscreen(value) {
        this.settings.set_boolean(DoNotDisturbOnFullscreenSetting, value);
    }

    getShouldDndOnAppsList() {
        return this.settings.get_boolean(DoNotDisturbOnAppsListSetting);
    }

    setShouldDndOnAppsList(value) {
        this.settings.set_boolean(DoNotDisturbOnAppsListSetting, value);
    }

    getDndAppsList() {
        return this.settings.get_strv(DoNotDisturbAppsListSetting);
    }

    setDndAppsList(value) {
        this.settings.set_strv(DoNotDisturbAppsListSetting, value);
    }

    getShouldDndOnDirectoriesList() {
        return this.settings.get_boolean(DoNotDisturbOnDirectoriesListSetting);
    }

    setShouldDndOnDirectoriesList(value) {
        this.settings.set_boolean(DoNotDisturbOnDirectoriesListSetting, value);
    }

    getDndDirectoriesList() {
        return this.settings.get_strv(DoNotDisturbDirectoriesListSetting);
    }

    setDndDirectoriesList(value) {
        this.settings.set_strv(DoNotDisturbDirectoriesListSetting, value);
    }

    connectToChanges(settingName, func) {
        return this.settings.connect(`changed::${settingName}`, func);
    }

    disconnect(subscriptionId) {
        this.settings.disconnect(subscriptionId);
    }
}

var DndReason;
(function (DndReason) {
    DndReason["screenSharing"] = "screenSharing";
    DndReason["screenRecording"] = "screenRecording";
    DndReason["fullscreen"] = "fullscreen";
    DndReason["appsList"] = "appsList";
    DndReason["directoriesList"] = "directoriesList";
})(DndReason || (DndReason = {}));

class DoNotDisturbWhileScreenSharingOrRecordingExtension extends Extension {
    constructor() {
        super(...arguments);
        this._settings = null;
        this._settingsSubscription = null;
        this._dndManager = null;
        this._activeDndReasons = new Set();
    }

    enable() {
        this._settings = new SettingsManager(this.getSettings(SettingsPath));
        this._screenRecordingNotifier = new ScreenRecordingNotifier();
        this._screenSharingNotifier = new ScreenSharingNotifier();
        this._fullscreenNotifier = new FullscreenNotifier();
        this._appListNotifier = new AppListNotifier();
        this._directoryListNotifier = new DirectoryListNotifier();
        this._dndManager = new DoNotDisturbManager();
        this._screenRecordingSubId = this._screenRecordingNotifier.subscribe(this.handleScreenRecording.bind(this));
        this._screenSharingSubId = this._screenSharingNotifier.subscribe(this.handleScreenSharing.bind(this));
        this._fullscreenSubId = this._fullscreenNotifier.subscribe(this.handleFullscreen.bind(this));
        this._appListSubId = this._appListNotifier.subscribe(() => this._settings?.getDndAppsList() ?? [], this.handleAppList.bind(this));
        this._directoryListSubId = this._directoryListNotifier.subscribe(() => this._settings?.getDndDirectoriesList() ?? [], this.handleDirectoriesList.bind(this));
    }

    handleScreenSharing(status) {
        if (!this._settings?.getShouldDndOnScreenSharing()) {
            this.updateDndReason(DndReason.screenSharing, false);

            return;
        }
        this.updateDndReason(DndReason.screenSharing, status === ScreenSharingStatus.sharing);
    }

    handleScreenRecording(status) {
        if (!this._settings?.getShouldDndOnScreenRecording()) {
            this.updateDndReason(DndReason.screenRecording, false);

            return;
        }
        this.updateDndReason(DndReason.screenRecording, status === ScreenRecordingStatus.recording);
    }

    handleFullscreen(status) {
        if (!this._settings?.getShouldDndOnFullscreen()) {
            this.updateDndReason(DndReason.fullscreen, false);

            return;
        }
        this.updateDndReason(DndReason.fullscreen, status === FullscreenStatus.fullscreen);
    }

    handleAppList(status) {
        if (!this._settings?.getShouldDndOnAppsList()) {
            this.updateDndReason(DndReason.appsList, false);

            return;
        }
        this.updateDndReason(DndReason.appsList, status === AppListStatus.running);
    }

    handleDirectoriesList(status) {
        if (!this._settings?.getShouldDndOnDirectoriesList()) {
            this.updateDndReason(DndReason.directoriesList, false);

            return;
        }
        this.updateDndReason(DndReason.directoriesList, status === DirectoryListStatus.running);
    }

    /**
     * Keeps track of what is currently requesting Do Not Disturb to be on.
     * DND is only switched off once none of the reasons are active anymore,
     * so e.g. screen sharing ending doesn't turn DND off while a full-screen
     * game from the apps list is still running.
     */
    updateDndReason(reason, active) {
        if (active) {
            this._activeDndReasons.add(reason);
        }
        else {
            this._activeDndReasons.delete(reason);
        }
        if (this._activeDndReasons.size > 0) {
            this._dndManager?.turnDndOn();
        }
        else {
            this._dndManager?.turnDndOff();
        }
    }

    disable() {
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
        if (this._fullscreenSubId) {
            this._fullscreenNotifier?.unsubscribe(this._fullscreenSubId);
            this._fullscreenSubId = null;
        }
        this._fullscreenNotifier = null;
        if (this._appListSubId) {
            this._appListNotifier?.unsubscribe(this._appListSubId);
            this._appListSubId = null;
        }
        this._appListNotifier = null;
        if (this._directoryListSubId) {
            this._directoryListNotifier?.unsubscribe(this._directoryListSubId);
            this._directoryListSubId = null;
        }
        this._directoryListNotifier = null;
        this._activeDndReasons.clear();
        this._dndManager?.dispose();
        this._dndManager = null;
        this._settings = null;
    }
}

export { DoNotDisturbWhileScreenSharingOrRecordingExtension as default };
