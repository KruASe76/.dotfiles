import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import { Markup } from '../../libs/markup.js';
import { SettingsType } from './settingsType.js'
import * as Utils from '../../libs/utils.js'

import {gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const ATTR_CHANGE_COLOR = 'colorStyling';
const ATTR_BOLD = 'bold';
const ATTR_ITALIC = 'italic';

const RESULT = 0;
const MESSAGE = 1;

export const PriorityMarkupSetting = GObject.registerClass({
    GTypeName: 'PriorityMarkupSetting'
}, class PriorityMarkupSetting extends GObject.Object {
    _init(logger) {
        // eslint-disable-next-line no-restricted-syntax
        super._init();
        this._priority = '';
        this._styleColor = false;
        this._color = 0;
        this._bold = false;
        this._italic = false;
        this.logger = logger;
    }

    set priority(priority) {
        if (!Utils.isValid(priority) || priority < 'A' || priority > 'Z') {
            this.logger.error(`invalid priority ${priority}`);
        }
        this._priority = priority;
    }

    get priority() {
        return this._priority;
    }

    set color(color) {
        if (!Utils.isValid(color)) {
            this.logger.error(`invalid color ${color}`);
        }
        this._color = color;
    }

    get color() {
        return this._color;
    }

    set colorStyling(enabled) {
        if (!Utils.isValid(enabled)) {
            this.logger.error(`invalid color styling setting ${enabled}`);
        }
        this._styleColor = !!enabled;
    }

    get colorStyling() {
        return this._styleColor;
    }

    set bold(enabled) {
        if (!Utils.isValid(enabled)) {
            this.logger.error(`invalid bold setting ${enabled}`);
        }
        this._bold = !!enabled;
    }

    get bold() {
        return this._bold;
    }

    set italic(enabled) {
        if (!Utils.isValid(enabled)) {
            this.logger.error(`invalid italic setting ${enabled}`);
        }
        this._italic = !!enabled;
    }

    get italic() {
        return this._italic;
    }

    print() {
        return `Prio: ${this.priority}, color: ${this._styleColor} ${this.color},
            bold: ${this.bold}, italic: ${this.italic}`;
    }
});


export class PriorityMarkupType extends SettingsType {
    get_widget() {
        return 'row';
    }

    get_row() {
        return this.get_widget();
    }

    _buildToggleColumn(params) {
        const factory = new Gtk.SignalListItemFactory();
        factory.connect('setup', (_factory, item) => {
            const box = new Gtk.Box();
            const MARGIN = 5;
            const toggle = new Gtk.Switch({
                hexpand: false,
                vexpand: false,
                margin_top: MARGIN,
                margin_bottom: MARGIN,
                margin_start: MARGIN,
                margin_end: MARGIN
            });
            box.append(toggle);
            item.set_child(box);
        });

        factory.connect('bind', (_factory, listItem) => {
            const toggle = listItem.get_child().get_first_child();
            const item = listItem.get_item();
            toggle.active = item[params.attribute];
            this._connections[item] = toggle.connect('notify::active', (button) => {
                params.logger.info(`setting prio ${item.priority} ${params.attribute} to ${button.active}`);
                item[params.attribute] = button.active;
                this._updatePriorityStylingFromListItem({
                    listItem,
                    prefsWindow: params.prefsWindow,
                    setting: params.setting,
                    settings: params.settings
                });
            });
        });

        factory.connect('unbind', (_factory, item) => {
            item.get_child().get_first_child().disconnect('notify::active', this._connections[item]);
        });

        params.column.set_factory(factory);
    }

    _buildPrioritiesFromSettings(params) {
        this.prioritiesMarkup = params.settings.get(params.setting);
        for (const markup in this.prioritiesMarkup) {
            if (Object.prototype.hasOwnProperty.call(this.prioritiesMarkup, markup)) {
                this._addPriorityToModel({
                    model: this.model,
                    priority: markup,
                    change_color: this.prioritiesMarkup[markup].changeColor,
                    color: this.prioritiesMarkup[markup].color,
                    bold: this.prioritiesMarkup[markup].bold,
                    italic: this.prioritiesMarkup[markup].italic,
                    logger: params.logger
                });
            }
        }
    }

    _addPriorityToModel(params) {
        const prioritySetting = new PriorityMarkupSetting(params.logger);
        prioritySetting.colorStyling = params.change_color;
        prioritySetting.priority = params.priority;
        prioritySetting.color = params.color;
        prioritySetting.bold = params.bold;
        prioritySetting.italic = params.italic;
        params.model.append(prioritySetting);
        params.logger.debug(`Added ${prioritySetting.print()}`);
    }

    _removePriorityStyle(params) {
        if (params.priority === null) {
            params.logger.error('Priority can not be null');
            return;
        }
        delete this.prioritiesMarkup[params.priority];
        params.settings.set(params.setting, this.prioritiesMarkup);
    }

    _updatePriorityStyling(params) {
        if (params.priority === null) {
            this.logger.error('Priority can not be null');
            return false;
        }
        let currentValue = this.prioritiesMarkup[params.priority];
        if (typeof currentValue === 'undefined') {
            // create new tuple with default values
            this.prioritiesMarkup[params.priority] = new Markup();
            currentValue = this.prioritiesMarkup[params.priority];
        }
        if (params.change_color !== null) {
            if (params.change_color === true) {
                if (params.color !== null) {
                    currentValue.color = params.color;
                }
            }
            currentValue.changeColor = params.change_color;
        }
        if (params.bold !== null) {
            currentValue.bold = params.bold;
        }
        if (params.italic !== null) {
            currentValue.italic = params.italic;
        }
        if (params.replace_prio !== params.priority) {
            if ((params.replace_prio !== null) && (params.replace_prio !== undefined)) {
                delete this.prioritiesMarkup[params.replace_prio];
            }
        }
        params.settings.set(params.setting, this.prioritiesMarkup);
        return true;
    }

    _checkPriorityCondition(model, check_function, message, priorityToBeAdded) {
        let result = true;
        let priority = '@';
        for (let i = 0; i < model.get_n_items(); i++) {
            result = result && check_function(model.get_item(i).priority);
            if (!result) {
                break;
            }
        }

        if (result && Utils.isValid(priorityToBeAdded)) {
            priority = priorityToBeAdded;
            result = result && check_function(priorityToBeAdded);
        }
        return [result, `${message}: ${priority}`];
    }

    _checkForInvalidPriorities(priorityToBeAdded) {
        const result = this._checkPriorityCondition(this.model, (priority) => {
            return (/^[A-Z]$/).test(priority);
        }, _("Wrong priority"), priorityToBeAdded);
        return result;
    }

    _validateModel(priorityToBeAdded) {
        const duplicate = this._checkForDuplicatePriorities(priorityToBeAdded);
        if (!duplicate[RESULT]) {
            return duplicate;
        }
        const invalid = this._checkForInvalidPriorities(priorityToBeAdded);
        if (!invalid[RESULT]) {
            return invalid;
        }
        return [true, ''];
    }

    _showErrorMessage(message, parent) {
        const dialog = new Adw.MessageDialog({
            modal: true,
            heading: _("Error"),
            body: message,
            transient_for: parent
        });
        dialog.add_response('ok', _("Ok"));
        dialog.connect('response', (dialog_object, _response) => {
            dialog_object.destroy();
        });
        dialog.show();
    }

    _updatePriorityStylingFromListItem(params) {
        const valid = this._validateModel();
        if (!valid[RESULT]) {
            this._showErrorMessage(valid[MESSAGE], params.prefsWindow);
            this.model.remove(params.listItem.get_position());
            return false;
        }
        const item = params.listItem.get_item();
        return this._updatePriorityStyling({
            priority: item.priority,
            change_color: item.colorStyling,
            color: item.color,
            bold: item.bold,
            italic: item.italic,
            replace_prio: params.replace_prio,
            setting: params.setting,
            settings: params.settings
        });
    }

    _checkForDuplicatePriorities(priorityToBeAdded) {
        const seenPriorities = [];
        if (Utils.isValid(priorityToBeAdded)) {
            seenPriorities.push(priorityToBeAdded);
        }
        for (let i = 0; i < this.model.get_n_items(); i++) {
            const priority = this.model.get_item(i).priority;
            if (!seenPriorities.includes(priority)) {
                seenPriorities.push(priority);
            } else {
                return [false, _("Duplicate priority: %(priority)").replace('%(priority)', priority)];
            }
        }
        return [true, ''];
    }

    extra(params) {
        this._connections = {};

        this.model = new Gio.ListStore({ item_type: PriorityMarkupSetting });

        this.selectionModel = new Gtk.SingleSelection({ model: this.model });

        const columnView = params.builder.get_object(`${params.setting}-view`);
        columnView.set_model(this.selectionModel);

        const PRIO_LENGTH = 1;

        let prioFactory = new Gtk.SignalListItemFactory();
        prioFactory.connect('setup', (_factory, item) => {
            const entry = new Gtk.Entry();
            entry.set_max_length(PRIO_LENGTH);
            item.set_child(entry);
        });
        prioFactory.connect('bind', (_factory, item) => {
            const entry = item.get_child();
            item.get_child().get_buffer().set_text(item.get_item().priority, PRIO_LENGTH);
            this._connections[item] = entry.get_buffer().connect('inserted-text',
                (ignored_entry, ignored_position, chars, n_chars) => {
                    if (n_chars > PRIO_LENGTH) {
                        params.logger.error('Priority too long');
                        return;
                    }
                    const oldPrio = item.get_item().priority;
                    item.get_item().priority = chars;
                    this._updatePriorityStylingFromListItem({
                        listItem: item,
                        replace_prio: oldPrio,
                        setting: params.setting,
                        settings: params.settings,
                        prefsWindow: params.prefsWindow
                    });
                });
        }
        );

        prioFactory.connect('unbind', (factory, item) => {
            item.get_child().disconnect('notify::active', this._connections[item]);
        });

        params.builder.get_object(`${params.setting}-prio-col`).set_factory(prioFactory);

        this._buildToggleColumn({
            attribute: ATTR_CHANGE_COLOR,
            column: params.builder.get_object(`${params.setting}-change-color-col`),
            logger: params.logger,
            setting: params.setting,
            settings: params.settings,
            prefsWindow: params.prefsWindow
        });
        let colorFactory = new Gtk.SignalListItemFactory();
        colorFactory.connect('setup', (factory, item) => {
            item.set_child(new Gtk.ColorButton({ modal: true }));
        });
        colorFactory.connect('bind', (factory, item) => {
            const colorButton = item.get_child();
            const color = new Gdk.RGBA();
            color.parse(item.get_item().color);
            colorButton.set_rgba(color);
            this._connections[item] = colorButton.connect('color-set', () => {
                const oldColor = new Gdk.RGBA();
                oldColor.parse(item.get_item().color);
                const newColor = colorButton.get_rgba();
                item.get_item().color = newColor.to_string();
                this._updatePriorityStylingFromListItem({
                    listItem: item,
                    prefsWindow: params.prefsWindow,
                    setting: params.setting,
                    settings: params.settings
                });
            });
        }
        );
        params.builder.get_object(`${params.setting}-color-col`).set_factory(colorFactory);
        this._buildToggleColumn({
            attribute: ATTR_BOLD,
            column: params.builder.get_object(`${params.setting}-bold-col`),
            logger: params.logger,
            setting: params.setting,
            settings: params.settings,
            prefsWindow: params.prefsWindow
        });
        this._buildToggleColumn({
            attribute: ATTR_ITALIC,
            column: params.builder.get_object(`${params.setting}-italic-col`),
            logger: params.logger,
            setting: params.setting,
            settings: params.settings,
            prefsWindow: params.prefsWindow
        });

        this._buildPrioritiesFromSettings({
            setting: params.setting,
            settings: params.settings,
            logger: params.logger
        });


        const addButton = params.builder.get_object(`${params.setting}-add-button`);
        addButton.connect('clicked', () => {
            const dialog = new Adw.MessageDialog({
                modal: true,
                heading: _("New priority style"),
                body: _("Please enter the priority"),
                transient_for: params.prefsWindow,
                default_response: 'add',
                close_response: 'cancel',
            });
            dialog.add_response('add', _("Add"));
            dialog.set_response_enabled('add', false);
            dialog.add_response('cancel', _("Cancel"));
            dialog.set_extra_child(new Gtk.Entry({
                activates_default: true,
                max_length: 1
            }));
            const priorityEntry = dialog['extra-child'];
            priorityEntry.connect('changed', (entry) => {
                if ((/^[A-Z]$/).test(entry.get_text())) {
                    dialog.set_response_enabled('add', true);
                    return;
                }
                if ((/^[a-z]$/).test(entry.get_text())) {
                    entry.set_text(entry.get_text().toUpperCase());
                    dialog.set_response_enabled('add', true);
                    return;
                }
                dialog.set_response_enabled('add', false);
            });
            dialog.connect('response', (dialog_object, response) => {
                const priority = dialog_object['extra-child'].get_text();
                if ((response === 'add') && (priority !== '')) {
                    const valid = this._validateModel(priority);
                    if (valid[RESULT]) {
                        const item = new PriorityMarkupSetting();
                        item.priority = priority;
                        item.changeColor = false;
                        item.color = 'rgb(255,255,255)';
                        item.bold = false;
                        item.italic = false;
                        this.model.append(item);
                        this._updatePriorityStyling({
                            priority: item.priority,
                            change_color: item.colorStyling,
                            color: item.color,
                            bold: item.bold,
                            italic: item.italic,
                            replace_prio: params.replace_prio,
                            setting: params.setting,
                            settings: params.settings
                        });
                    } else {
                        this._showErrorMessage(valid[MESSAGE], params.prefsWindow);
                    }
                }
            });
            dialog.present();
        });

        const deleteButton = params.builder.get_object(`${params.setting}-delete-button`);
        deleteButton.connect('clicked', () => {
            const selected = this.selectionModel.get_selected();
            if (selected === Gtk.INVALID_LIST_POSITION) {
                return;
            }
            this._removePriorityStyle({
                priority: this.model.get_item(selected).priority,
                setting: params.setting,
                settings: params.settings,
                logger: params.logger
            });
            this.model.remove(selected);
        });
    }
}
