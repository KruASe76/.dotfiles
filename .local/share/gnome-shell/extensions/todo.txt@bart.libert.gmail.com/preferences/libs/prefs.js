import Gtk from 'gi://Gtk';

import { Settings } from '../../libs/settings.js';
import * as Shared from '../../libs/sharedConstants.js';
import * as Utils from '../../libs/utils.js';
import { getType as getSettingsType } from '../types/helpers.js'

export class Prefs {
    constructor(params, prefsWindow) {
        this.logger = Utils.getDefaultLogger();
        this.logger.level = Shared.LOG_INFO;
        params['logger'] = this.logger;

        this.settings = new Settings(params);
        this.builder = Gtk.Builder.new();
        this.builder.add_from_file(`${params.extensionPath}/preferences/ui/prefs.xml`);
        this.window = prefsWindow;
        this.extensionPath = params.extensionPath;
    }

    _optionToInteger(option) {
        const result = /^#(.*)#$/.exec(option);
        if (result !== null) {
            const importPath = result[1].charAt(0).toLowerCase() + result[1].substring(1);
            const parts = importPath.split('.');
            if (parts[0] !== 'sharedConstants') {
                this.logger.error(`Can only convert to integer from sharedConstants, not ${parts[0]}`);
            }
            return parseInt(Shared[parts[1]]);
        }
        return parseInt(option);
    }

    _convertOptionArrayToIndexedArray(optionArray) {
        const indexedOptions = {};
        for (const option in optionArray) {
            if (Object.prototype.hasOwnProperty.call(optionArray, option)) {
                indexedOptions[this._optionToInteger(option)] = optionArray[option];
            }
        }
        return indexedOptions;
    }

    _getSensitivityArrayFromData(data) {
        if (!Utils.isChildValid(data, 'extra_params')) {
            return null;
        }
        if (!Utils.isChildValid(data['extra_params'], 'sensitivity')) {
            return null;
        }
        return data['extra_params']['sensitivity'];
    }

    _isSensitive(data) {
        const sensitivityArray = this._getSensitivityArrayFromData(data);
        if (sensitivityArray === null) {
            return true;
        }
        for (const checkSetting in sensitivityArray) {
            if (Object.prototype.hasOwnProperty.call(sensitivityArray, checkSetting)) {
                let checkSettingArray = sensitivityArray[checkSetting];
                if (this.settings.getType(checkSetting) === 'integer') {
                    checkSettingArray = this._convertOptionArrayToIndexedArray(sensitivityArray[
                        checkSetting]);
                }
                const currentCheckSettingValue = this.settings.get(checkSetting);
                if (typeof checkSettingArray[currentCheckSettingValue] !== 'undefined') {
                    return checkSettingArray[currentCheckSettingValue];
                }
            }
        }
        return true;
    }

    _registerSensitivity(data, callback) {
        const sensitivityArray = this._getSensitivityArrayFromData(data);
        if (sensitivityArray === null) {
            return;
        }
        for (const sensitivitySetting in sensitivityArray) {
            if (Object.prototype.hasOwnProperty.call(sensitivityArray, sensitivitySetting)) {
                this.settings.registerForChange(sensitivitySetting, callback);
            }
        }
    }

    _convertWidgetValueToSetting(value, data) {
        if (!Utils.isChildValid(data, 'extra_params')) {
            return value;
        }
        if (!Utils.isChildValid(data['extra_params'], 'options')) {
            return value;
        }
        const indexedOptions = this._convertOptionArrayToIndexedArray(data['extra_params']['options']);
        let counter = 0;
        for (const option in indexedOptions) {
            if (Object.prototype.hasOwnProperty.call(indexedOptions, option)) {
                if (counter === value) {
                    return parseInt(option);
                }
                counter++;
            }
        }
        return value;
    }

    _convertSettingToWidgetValue(value, data) {
        const MIN_VALUE = 0;
        if (value < MIN_VALUE) {
            return MIN_VALUE;
        }
        if (!Utils.isChildValid(data, 'extra_params')) {
            return value;
        }
        if (!Utils.isChildValid(data['extra_params'], 'options')) {
            return value;
        }
        const indexedOptions = this._convertOptionArrayToIndexedArray(data['extra_params']['options']);
        let counter = 0;
        for (const option in indexedOptions) {
            if (Object.prototype.hasOwnProperty.call(indexedOptions, option)) {
                if (parseInt(option) === value) {
                    return counter;
                }
                counter++;
            }
        }
        return value;
    }

    _connectSettings(window) {
        for (const [setting, data] of this.settings.getAll()) {
            const type = getSettingsType(data);
            if (type === null) {
                this.logger.error(`No type for ${setting}`);
                continue;
            }
            const [valid, error] = type.validate(setting, data);
            if (!valid) {
                this.logger.error(error);
                continue;
            }
            const widget = this.builder.get_object(`${setting}-${type.get_widget()}`);
            if (widget === null) {
                this.logger.error(`No widget for ${setting}`);
                continue;
            }
            for (const template of type.additional_templates()) {
                this.builder.add_from_file(`${this.extensionPath}/${template}`);
            }

            if (type.get_signal() !== null) {
                widget.connect(type.get_signal(), (object) => {
                    this.settings.set(setting,
                        this._convertWidgetValueToSetting(type.get_value_from_widget(object), data));
                });
            }
            const params = {
                widget,
                setting,
                settings: this.settings,
                setting_data: data,
                builder: this.builder,
                prefsWindow: window,
                logger: this.logger
            };
            type.extra(params);
            type.update_widget(widget, this._convertSettingToWidgetValue(this.settings.get(setting), data));
            this._registerSensitivity(data, () => {
                this.builder.get_object(`${setting}-${type.get_row()}`).sensitive = this._isSensitive(data);
            });
            this.builder.get_object(`${setting}-${type.get_row()}`).sensitive = this._isSensitive(data);
        }
    }

    fillPreferencesWindow(window) {
        const pages = ['general', 'display', 'priorities', 'extensions'];
        for (const page of pages) {
            window.add(this.builder.get_object(`${page}-page`));
        }
        this._connectSettings(window);
    }
}
