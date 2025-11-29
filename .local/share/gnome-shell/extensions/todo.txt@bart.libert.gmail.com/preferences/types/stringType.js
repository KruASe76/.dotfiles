import { SettingsType } from './settingsType.js'

export class StringType extends SettingsType {
    get_widget() {
        return 'string';
    }

    get_signal() {
        return 'changed';
    }

    get_value_from_widget(object) {
        return object.get_text();
    }

    update_widget(widget, setting_value) {
        widget.set_text(setting_value);
    }
}
