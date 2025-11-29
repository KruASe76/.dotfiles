import { SettingsType } from './settingsType.js'

export class SpinType extends SettingsType {
    get_widget() {
        return 'spin-button';
    }

    get_signal() {
        return 'value-changed';
    }

    get_value_from_widget(object) {
        return object.get_value_as_int();
    }

    update_widget(widget, setting_value) {
        widget.set_value(setting_value);
    }
}
