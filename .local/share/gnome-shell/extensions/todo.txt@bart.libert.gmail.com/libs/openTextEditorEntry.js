import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import {PopupImageMenuItem} from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Message from './messageDialog.js';

export const OpenTextEditorEntry = GObject.registerClass({
    GTypeName: 'OpenTextEditorEntry'
}, class extends PopupImageMenuItem {
    _init(data, params) {
        super._init(_("Open todo.txt file in text editor"), 'editor-symbolic', params);
        this.connect('activate', (object, event) => {
            try {
                const CURRENT_WORKSPACE = -1;
                Gio.AppInfo.launch_default_for_uri(GLib.filename_to_uri(data.todofile, null),
                    global.create_app_launch_context(event.get_time(), CURRENT_WORKSPACE));
            } catch (exception) {
                const message = new Message(_("Cannot open file"),
                    _(
                        "An error occured while trying to launch the default text editor: %(error)"
                    ).replace('%(error)', exception.message));
                message.open();
            }
        });
    }
});

/* vi: set expandtab tabstop=4 shiftwidth=4: */
