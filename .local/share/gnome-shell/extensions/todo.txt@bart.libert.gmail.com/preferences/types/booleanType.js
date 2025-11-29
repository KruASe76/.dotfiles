import { SettingsType } from './settingsType.js';

export class BooleanType extends SettingsType {
    get_widget() {
        return 'switch';
    }

    get_row() {
        return 'row';
    }

    get_signal() {
        return 'state-set';
    }

    get_value_from_widget(object) {
        return object.active;
    }

    update_widget(widget, setting_value) {
        widget.set_active(setting_value);
    }
}
