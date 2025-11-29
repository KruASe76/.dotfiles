import Gio from 'gi://Gio';

import { SettingsType } from './settingsType.js'

export class HelpType extends SettingsType {
    get_widget() {
        return 'help-button';
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

    validate(setting, setting_data) {
        if (setting_data['url'] === null || setting_data['url'] === undefined) {
            return [false, `${setting} has no url`];
        }
        return [true, ''];
    }

    extra(params) {
        params.widget.connect('clicked', (_object) => {
            Gio.AppInfo.launch_default_for_uri_async(params.setting_data['url'], null, null, null);
        });
    }
}
