import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

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

class Preferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage();
        const settings = new SettingsManager(this.getSettings(SettingsPath));
        const group = new Adw.PreferencesGroup({
            title: "Automatic Do Not Disturb Mode",
            description: "Select what events should cause Do Not Disturb mode to be switched on automatically",
        });
        this.setupScreenRecording(settings, group);
        this.setupScreenSharing(settings, group);
        page.add(group);
        window.add(page);
    }

    setupScreenRecording(settings, group) {
        const row = new Adw.ActionRow({
            title: "Screen Recording",
        });
        const toggle = new Gtk.Switch({
            active: settings.getShouldDndOnScreenRecording(),
            valign: Gtk.Align.CENTER,
        });
        toggle.connect("state-set", (_, state) => {
            settings.setShouldDndOnScreenRecording(state);

            return false;
        });
        row.add_suffix(toggle);
        row.activatable_widget = toggle;
        group.add(row);
    }

    setupScreenSharing(settings, group) {
        const isWayland = settings.getIsWayland();
        const row = new Adw.ActionRow({
            title: "Screen Sharing",
            subtitle: !isWayland
                ? "Disabled, since it works only on Wayland sessions, and you are running X11"
                : "",
            sensitive: isWayland,
        });
        const toggle = new Gtk.Switch({
            active: isWayland ? settings.getShouldDndOnScreenSharing() : false,
            valign: Gtk.Align.CENTER,
            sensitive: isWayland,
        });
        toggle.connect("state-set", (_, state) => {
            settings.setShouldDndOnScreenSharing(state);

            return false;
        });
        row.add_suffix(toggle);
        row.activatable_widget = toggle;
        group.add(row);
    }
}

export { Preferences as default };
