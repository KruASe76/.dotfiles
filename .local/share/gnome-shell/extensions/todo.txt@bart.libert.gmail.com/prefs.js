import { Prefs } from './preferences/libs/prefs.js';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TodoTxtExtensionPreferences extends ExtensionPreferences {
    async fillPreferencesWindow(window) {
        const schema = 'org.gnome.shell.extensions.TodoTxt'
        const params = {
            settingsFile: `${this.path}/settings.json`,
            schema: schema,
            settings: this.getSettings(schema),
            extensionPath: this.path
        }
        const prefs = await Prefs.create(params, window);
        window.search_enabled = true;
        prefs.fillPreferencesWindow(window);
    }
}
// /* vi: set expandtab tabstop=4 shiftwidth=4: */
