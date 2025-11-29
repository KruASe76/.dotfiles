import GObject from 'gi://GObject';
import {PopupImageMenuItem} from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export const OpenPreferencesEntry = GObject.registerClass({
    GTypeName: 'OpenPreferencesEntry'
}, class extends PopupImageMenuItem {
    _init(data, params) {
        super._init(_("Open preferences"), 'settings-symbolic', params);
        this.connect('activate', (_object, _event) => {
            data.extension.openPreferences();
        });
    }
});

/* vi: set expandtab tabstop=4 shiftwidth=4: */
