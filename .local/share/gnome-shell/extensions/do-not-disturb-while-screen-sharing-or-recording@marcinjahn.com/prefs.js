import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

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
        this.setupFullscreen(settings, group);
        page.add(group);
        const appsGroup = new Adw.PreferencesGroup({
            title: "Applications & Directories Lists",
            description: "Switch Do Not Disturb mode on automatically while any of the listed applications is running, or while an application from within any of the listed directories is running (e.g. games)",
        });
        this.setupAppsList(settings, appsGroup);
        this.setupDirectoriesList(settings, appsGroup);
        page.add(appsGroup);
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
        const row = new Adw.ActionRow({
            title: "Screen Sharing",
        });
        const toggle = new Gtk.Switch({
            active: settings.getShouldDndOnScreenSharing(),
            valign: Gtk.Align.CENTER,
        });
        toggle.connect("state-set", (_, state) => {
            settings.setShouldDndOnScreenSharing(state);

            return false;
        });
        row.add_suffix(toggle);
        row.activatable_widget = toggle;
        group.add(row);
    }

    setupFullscreen(settings, group) {
        const row = new Adw.ActionRow({
            title: "Full Screen Application",
            subtitle: "Any application running in full screen, e.g. videos or games",
        });
        const toggle = new Gtk.Switch({
            active: settings.getShouldDndOnFullscreen(),
            valign: Gtk.Align.CENTER,
        });
        toggle.connect("state-set", (_, state) => {
            settings.setShouldDndOnFullscreen(state);

            return false;
        });
        row.add_suffix(toggle);
        row.activatable_widget = toggle;
        group.add(row);
    }

    setupAppsList(settings, group) {
        const expander = new Adw.ExpanderRow({
            title: "Specific Applications",
            subtitle: "Add applications by their WM_CLASS (e.g. steam, org.gnome.Showtime, etc).",
        });
        const enableToggle = new Gtk.Switch({
            active: settings.getShouldDndOnAppsList(),
            valign: Gtk.Align.CENTER,
        });
        enableToggle.connect("state-set", (_, state) => {
            settings.setShouldDndOnAppsList(state);

            return false;
        });
        expander.add_action(enableToggle);
        const appRows = [];
        const refreshAppRows = () => {
            for (const appRow of appRows) {
                expander.remove(appRow);
            }
            appRows.length = 0;
            for (const app of settings.getDndAppsList()) {
                const appRow = new Adw.ActionRow({ title: app });
                const removeButton = new Gtk.Button({
                    icon_name: "list-remove-symbolic",
                    valign: Gtk.Align.CENTER,
                    css_classes: ["flat"],
                });
                removeButton.connect("clicked", () => {
                    settings.setDndAppsList(settings.getDndAppsList().filter((existingApp) => existingApp !== app));
                    refreshAppRows();
                });
                appRow.add_suffix(removeButton);
                expander.add_row(appRow);
                appRows.push(appRow);
            }
        };
        const entryRow = new Adw.EntryRow({
            title: "Add an application (WM_CLASS)",
        });
        const addApp = () => {
            const value = entryRow.text.trim();
            if (!value) {
                return;
            }
            const existingApps = settings.getDndAppsList();
            if (existingApps.some((app) => app.toLowerCase() === value.toLowerCase())) {
                entryRow.text = "";

                return;
            }
            settings.setDndAppsList([...existingApps, value]);
            entryRow.text = "";
            refreshAppRows();
        };
        const addButton = new Gtk.Button({
            icon_name: "list-add-symbolic",
            valign: Gtk.Align.CENTER,
            css_classes: ["flat"],
        });
        addButton.connect("clicked", addApp);
        entryRow.connect("entry-activated", addApp);
        entryRow.add_suffix(addButton);
        expander.add_row(entryRow);
        refreshAppRows();
        group.add(expander);
    }

    setupDirectoriesList(settings, group) {
        const expander = new Adw.ExpanderRow({
            title: "Directories List",
            subtitle: "Add directories (e.g. ~/Games/). Any application running from within one of them will trigger Do Not Disturb, including Wine/Proton games (matched via their process's executable path and command line arguments).",
        });
        const enableToggle = new Gtk.Switch({
            active: settings.getShouldDndOnDirectoriesList(),
            valign: Gtk.Align.CENTER,
        });
        enableToggle.connect("state-set", (_, state) => {
            settings.setShouldDndOnDirectoriesList(state);

            return false;
        });
        expander.add_action(enableToggle);
        const directoryRows = [];
        const refreshDirectoryRows = () => {
            for (const directoryRow of directoryRows) {
                expander.remove(directoryRow);
            }
            directoryRows.length = 0;
            for (const directory of settings.getDndDirectoriesList()) {
                const directoryRow = new Adw.ActionRow({ title: directory });
                const removeButton = new Gtk.Button({
                    icon_name: "list-remove-symbolic",
                    valign: Gtk.Align.CENTER,
                    css_classes: ["flat"],
                });
                removeButton.connect("clicked", () => {
                    settings.setDndDirectoriesList(settings
                        .getDndDirectoriesList()
                        .filter((existingDirectory) => existingDirectory !== directory));
                    refreshDirectoryRows();
                });
                directoryRow.add_suffix(removeButton);
                expander.add_row(directoryRow);
                directoryRows.push(directoryRow);
            }
        };
        const entryRow = new Adw.EntryRow({
            title: "Add a directory (e.g. ~/Games/)",
        });
        const addDirectory = () => {
            const value = entryRow.text.trim();
            if (!value) {
                return;
            }
            const existingDirectories = settings.getDndDirectoriesList();
            if (existingDirectories.some((directory) => directory.toLowerCase() === value.toLowerCase())) {
                entryRow.text = "";

                return;
            }
            settings.setDndDirectoriesList([...existingDirectories, value]);
            entryRow.text = "";
            refreshDirectoryRows();
        };
        const addButton = new Gtk.Button({
            icon_name: "list-add-symbolic",
            valign: Gtk.Align.CENTER,
            css_classes: ["flat"],
        });
        addButton.connect("clicked", addDirectory);
        entryRow.connect("entry-activated", addDirectory);
        entryRow.add_suffix(addButton);
        expander.add_row(entryRow);
        refreshDirectoryRows();
        group.add(expander);
    }
}

export { Preferences as default };
