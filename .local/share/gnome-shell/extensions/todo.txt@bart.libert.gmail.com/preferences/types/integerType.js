import { SettingsType } from './settingsType.js'

export class IntegerType extends SettingsType {
    get_widget() {
        return 'combo';
    }

    get_signal() {
        return 'notify::selected';
    }

    get_value_from_widget(object) {
        return object.get_selected();
    }

    update_widget(widget, setting_value) {
        widget.set_selected(setting_value);
    }
}
