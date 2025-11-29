// This extension was developed by Bart Libert
//
// Based on code by :
// * Baptiste Saleil http://bsaleil.org/
// * Arnaud Bonatti https://github.com/Obsidien
//
// Licence: GPLv2+

import { TodoTxtManager } from './libs/todoTxtManager.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class TodoTxtExtension extends Extension {
    enable() {
        const params = {
            settingsFile: `${this.path}/settings.json`,
            schema: 'org.gnome.shell.extensions.TodoTxt',
            settings: this.getSettings('org.gnome.shell.extensions.TodoTxt'),
            extensionPath: this.path,
            extension: this
        }
        this._manager = new TodoTxtManager();
        this._manager.enable(params);
    }
    disable() {
        this._manager.disable();
        this._manager = null;
    }
}

/* vi: set expandtab tabstop=4 shiftwidth=4: */
