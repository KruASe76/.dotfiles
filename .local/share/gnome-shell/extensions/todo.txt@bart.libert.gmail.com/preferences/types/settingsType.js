export class SettingsType {
    get_widget() {
        return 'unknown';
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

    update_widget(_widget, _setting_value) {
    }

    validate(_setting, _setting_data) {
        return [true, ''];
    }

    extra(_params) {
    }

    additional_templates() {
        return [];
    }
}
