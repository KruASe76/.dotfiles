import Gdk from  'gi://Gdk';
import { SettingsType } from './settingsType.js'

export class ColorType extends SettingsType {
    get_widget() {
        return 'color-button';
    }

    get_signal() {
        return 'color-set';
    }

    get_value_from_widget(object) {
        return object.get_rgba().to_string();
    }

    update_widget(widget, setting_value) {
        const currentColor = new Gdk.RGBA();
        currentColor.parse(setting_value);
        widget.set_rgba(currentColor);
    }
}
