import Gtk from 'gi://Gtk';
import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { SettingsType } from './settingsType.js'

export class PathType extends SettingsType {
    _selectPath(entryTarget, title, setting, settings, prefsWindow) {
        let dialogTitle = _("Select file");
        if (title !== null) {
            dialogTitle = title;
        }
        const chooser = new Gtk.FileChooserDialog({
            title: dialogTitle,
            action: Gtk.FileChooserAction.OPEN,
            modal: true,
            transient_for: prefsWindow
        });

        chooser.add_button(_("Cancel"), Gtk.ResponseType.CANCEL);
        chooser.add_button(_("Open"), Gtk.ResponseType.OK);
        chooser.set_default_response(Gtk.ResponseType.OK);
        chooser.connect('response', (dialog, response_id) => {
            if (response_id === Gtk.ResponseType.OK) {
                const file = dialog.get_file();
                if (file) {
                    entryTarget.set_subtitle(file.get_path());
                    settings.set(setting, file.get_path());
                }
            }
            dialog.destroy();
        });
        chooser.show();
    }

    get_widget() {
        return 'path';
    }

    get_row() {
        return this.get_widget();
    }

    get_signal() {
        return null;
    }

    get_value_from_widget(_object) {
        return null;
    }

    update_widget(widget, setting_value) {
        widget.set_subtitle(setting_value);
    }

    extra(params) {
        params.widget.connect('activated', (_object) => {
            this._selectPath(params.widget, _(params.settings.getExtraParams(params.setting)['description']),
                params.setting, params.settings, params.prefsWindow);
        });
    }
}
