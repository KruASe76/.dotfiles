import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Pango from 'gi://Pango';
import {PopupBaseMenuItem} from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {GrabHelper} from 'resource:///org/gnome/shell/ui/grabHelper.js';

import * as Shared from './sharedConstants.js';
import { TaskURLHighlighter } from './urlHighlighter.js';
import * as Utils from './utils.js';

import * as JsTodo from '../third_party/jsTodoTxt/jsTodoTxt.js';
import TimeFrame from '../third_party/timeframe/src/timeframe.js';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export const TodoMenuItem = GObject.registerClass({
    GTypeName: 'TodoMenuItem'
}, class extends PopupBaseMenuItem {

    _init(task, settings, actions, params) {
        const valueOrDefault = Utils.getDefaultIfInvalid;
        // eslint-disable-next-line no-restricted-syntax
        super._init(params);
        this.labelExpanded = false;
        this.buttons = [];
        this.labels = [];
        this.taskActions = Object.assign({
            'doneAction': null,
            'archiveAction': null,
            'deleteAction': null,
            'editAction': null,
            'priorityAction': null
        }, actions);
        this.task = valueOrDefault(task, null);
        this.ellipsizeMode = valueOrDefault(settings.get('long-tasks-ellipsize-mode'), Shared.TASK_ELLIPSIZE_MIDDLE);
        this.maxWidth = valueOrDefault(settings.get('long-tasks-max-width'), undefined);
        this.settings = valueOrDefault(settings, null);
        this._createTextLabel();
        this.actor.add_child(this.label);
        this._addProjectsLabel();
        this._addContextsLabel();
        this._addDueDateLabel();
        this._addButtons();
        this._setClickAction();
        this._applyPriorityStyling();
        this._applyDoneTaskStyling();

        if (settings.get('truncate-long-tasks')) {
            this._truncate(settings.get('long-tasks-expansion-mode'));
        }

        this.label.add_style_class_name('todo-txt-task-label');
        this.grabHelper = new GrabHelper(this);
        this.connect('destroy', this._onDestroy.bind(this));
    }

    _onDestroy() {
        if (this.editTask !== null) {
            this.grabHelper.ungrab({ actor: this.editTask });
            this.editTask = null;
            this.grabHelper = null;
        }
    }

    _RGBAColorToHex(rgbaColor) {
        return rgbaColor.toString(16).padStart(2, "0");
    }

    _RGBAStringtoHexString(rgbaColorString) {
        const [success, rgbaColor] = Cogl.Color.from_string(rgbaColorString);
        if (success) {
            return `#${this._RGBAColorToHex(rgbaColor.red)}${this._RGBAColorToHex(rgbaColor.green)}${this._RGBAColorToHex(rgbaColor.blue)}`;
        }
        return null;
    }

    expandLabel() {
        if (!this.labelExpanded) {
            const NO_HEIGHT_DEFINED = -1;
            const NO_WIDTH_DEFINED = -1;
            const NATURAL_VALUE = 1;
            const singleLineWidth = this.label.clutter_text.get_preferred_width(NO_HEIGHT_DEFINED)[NATURAL_VALUE];
            const singleLineHeight = this.label.clutter_text.get_preferred_height(NO_WIDTH_DEFINED)[NATURAL_VALUE];

            const numberOfLinesNeeded = Math.round((singleLineWidth / this.maxWidth) + 1);

            this.label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
            this.label.clutter_text.set_line_wrap(true);
            this.label.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);
            this.label.set_height(numberOfLinesNeeded * singleLineHeight);

            this.labelExpanded = true;
            for (let i = 0, len = this.buttons.length; i < len; i++) {

                this.buttons[i].set_style(`margin-bottom: ${(numberOfLinesNeeded - 1) * singleLineHeight}px;`
                );
            }
        }
    }

    _convertEllipsizeMode(configEllipsizeMode) {
        if (configEllipsizeMode === Shared.TASK_ELLIPSIZE_START) {
            return Pango.EllipsizeMode.START;
        }
        if (configEllipsizeMode === Shared.TASK_ELLIPSIZE_MIDDLE) {
            return Pango.EllipsizeMode.MIDDLE;
        }
        return Pango.EllipsizeMode.END;
    }

    contractLabel() {
        if (this.labelExpanded) {
            this.label.clutter_text.set_ellipsize(this._convertEllipsizeMode(this.ellipsizeMode));
            this.label.clutter_text.set_line_wrap(false);
            this.label.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);
            const AUTO = -1;
            this.label.set_height(AUTO);
            this.labelExpanded = false;
            for (let i = 0, len = this.buttons.length; i < len; i++) {
                this.buttons[i].set_style('margin-bottom: 0px;');
            }
        }
    }

    _truncate(expansionMode) {
        this.label.clutter_text.set_ellipsize(this._convertEllipsizeMode(this.ellipsizeMode));
        this.label.set_reactive(true);
        if (expansionMode === Shared.TASK_EXPAND_SCROLL || expansionMode === Shared.TASK_EXPAND_BOTH) {
            this.label.connect('scroll-event', (_o, e) => {
                if (e.get_scroll_direction() === Clutter.ScrollDirection.UP) {
                    this.contractLabel();
                    return;
                }
                if (e.get_scroll_direction() === Clutter.ScrollDirection.DOWN) {
                    this.expandLabel();

                }
            });
        }
        // Preserve existing styles and add max-width
       const currentStyle = this.label.get_style() || '';
       this.label.set_style(`${currentStyle} max-width: ${this.maxWidth}px; `);
    }

    _getLabelText(source) {
        if (source.constructor === Array) {
            return source.join();
        }
        if (source.constructor === Date) {
            return new TimeFrame(source.toISOString()).moment();
        }
        return source;
    }

    _addLabel(labelSource) {
        const label = new St.Label({
            text: '',
            x_align: Clutter.ActorAlign.END
        });
        if (Utils.isValid(this.task[labelSource])) {
            label.set_text(this._getLabelText(this.task[labelSource]));
            this.actor.add_child(label);
            this.labels.push(label);
        }
    }

    _addProjectsLabel() {
        if (this.settings.get('show-projects-label')) {
            this._addLabel('projects');
        }
    }

    _addContextsLabel() {
        if (this.settings.get('show-contexts-label')) {
            this._addLabel('contexts');
        }
    }

    _addDueDateLabel() {
        if (this.settings.get('enable-due-date-extension')) {
            this._addLabel('due');
        }
    }

    _createTextLabel() {
        let markupFunction = (url, color) => {
            return `<span foreground="${color}"><u>${url}</u></span>`;
        };
        const urlColor = this.settings.get('url-color');
        if (urlColor === Shared.URL_COLOR_TASK) {
            markupFunction = (url, _color) => {
                return `<u>${url}</u>`;
            };
        }
        if (urlColor === Shared.URL_COLOR_CUSTOM) {
            const hexColor = this._RGBAStringtoHexString(this.settings.get('custom-url-color'));
            if (hexColor !== null) {
                markupFunction = (url, _color) => {
                    return `<span foreground="${hexColor}"><u>${url}</u></span>`;
                };
            }
        }
        this.highlighter = new TaskURLHighlighter(this.task.text, false, true, markupFunction);
        this.label = this.highlighter;
        this.label.x_expand = true;
    }

    _addButtons() {
        const expansionMode = this.settings.get('long-tasks-expansion-mode');
        if (expansionMode === Shared.TASK_EXPAND_BUTTON || expansionMode === Shared.TASK_EXPAND_BOTH) {
            this._addExpandButton();
        }
        if (this.settings.get('show-done-or-archive-button')) {
            if (!this.task.complete) {
                this._addDoneButton();
            } else {
                this._addArchiveButton();
            }
        }
        if (this.settings.get('show-delete-button')) {
            this._addDeleteButton();
        }
        if (this.settings.get('show-edit-button')) {
            this._addEditButton();
        }
        if (this.settings.get('show-priority-buttons')) {
            this._addPriorityButtons();
        }
    }

    _addEditButton() {
        const editButton = this._createButton('input-keyboard-symbolic',
            _('Edit %(task)'.replace('%(task)', this.task.text)));
        editButton.connect('clicked', () => this.enterEditMode());
        this.actor.add_child(editButton);
    }

    _addPriorityButton(up) {
        const prioButton = this._createButton(`go-${(up === true) ? 'up' : 'down'}-symbolic`, (up ===
            true)
            ? _('Increase %(task) priority'.replace('%(task)', this.task.text))
            : _('Decrease %(task) priority'.replace('%(task)', this.task.text)));
        const _up = up;
        prioButton.connect('clicked', () => {
            this.taskActions.priorityAction(this.task, _up);
        });
        this.actor.add_child(prioButton);
    }

    _addPriorityButtons() {
        this._addPriorityButton(true);
        this._addPriorityButton(false);
    }

    _addArchiveButton() {
        const archiveButton = this._createButton('document-save-symbolic',
            _('Archive %(task)'.replace('%(task)', this.task.text)));
        archiveButton.connect('clicked', () => {
            this.taskActions.archiveAction(this.task);
        });
        this.actor.add_style_class_name('doneTaskItem');
        this.actor.add_child(archiveButton);
    }

    _addDeleteButton() {
        const deleteButton = this._createButton('edit-delete-symbolic',
            _('Delete %(task)'.replace('%(task)', this.task.text)));
        deleteButton.connect('clicked', () => this.enterDeleteMode());
        this.actor.add_child(deleteButton);
    }


    _addExpandButton() {
        const iconNames = [
            'view-more-symbolic',
            'content-loading-symbolic',
            'zoom-in-symbolic',
            'zoom-original-symbolic',
            'view-more',
            'content-loading',
            'zoom-in',
            'zoom-original'
        ];

        const expandButton = this._createButton(iconNames,
            _('Expand %(task)'.replace('%(task)', this.task.text)));
        expandButton.connect('clicked', () => {
            if (this.labelExpanded) {
                this.contractLabel();
            } else {
                this.expandLabel();
            }
        });
        this.actor.add_child(expandButton);
    }

    _addDoneButton() {
        const doneButton = this._createButton('object-select-symbolic',
            _('Mark %(task) as done'.replace('%(task)', this.task.text)));
        doneButton.connect('clicked', () => {
            this.taskActions.doneAction(this.task);
        });
        this.actor.add_child(doneButton);
    }

    _createButton(iconNames, accessible_name, dont_store) {
        const gicon = Utils.getIconFromNames(iconNames);
        const button = new St.Button({
            child: new St.Icon({
                gicon,
                y_expand: false
            }),
            y_align: Clutter.ActorAlign.START,
            reactive: true,
            can_focus: true,
            track_hover: true,
            style_class: 'todo-txt-task-button',
            y_expand: false,
        });
        dont_store = dont_store || false;
        if (Utils.isValid(accessible_name)) {
            button.set_accessible_name(accessible_name);
        }
        if (!dont_store) {
            this.buttons.push(button);
        }
        return button;
    }

    _applyDoneTaskStyling() {
        if (!this.task.complete) {
            return
        }

        let style = '';
        if (this.settings.get('done-task-italic')) {
            style += 'font-style: italic; '
        }

        if (this.settings.get('done-task-bold')) {
            style += 'font-weight: bold; '
        }

        if (this.settings.get('done-task-strikethrough')) {
            style += 'text-decoration: line-through; '
        }

        let [result, color] = Cogl.Color.from_string(this.settings.get('custom-done-tasks-color') || '')
        if (this.settings.get('color-done-tasks') && result) {
            style += `color: rgb(${color.red}, ${color.green}, ${color.blue}); `
        }

        this.label.set_style(style);
    }

    _applyPriorityStyling() {
        if (!this.settings.get('style-priorities')) {
            return;
        }
        const markup = this.settings.get('priorities-markup')[this.task.priority];
        if (!Utils.isValid(markup)) {
            return;
        }
        let style = '';
        if (markup.changeColor === true) {
            style = `${style}color:${markup.color}; `;
        }
        if (markup.bold === true) {
            style = `${style}font-weight: bold; `;
        }
        if (markup.italic === true) {
            style = `${style}font-style: italic; `;
        }
        this.label.set_style(style);
    }

    _setClickAction() {
        this.connect('activate', () => {
            switch (this.settings.get('click-action')) {
            case Shared.CLICK_ACTION_EDIT:
                this.enterEditMode();
                break;
            case Shared.CLICK_ACTION_DONE:
                this.taskActions.doneAction(this.task);
                break;
            default:
                break;
            }
        });
    }

    set active(active) {
        const activeChanged = active !== this.active;
        if (activeChanged) {
            this._active = active;
            if (active) {
                this.actor.add_style_class_name('selected');
            } else {
                this.actor.remove_style_class_name('selected');
                // Remove the CSS active state if the user press the button and
                // while holding moves to another menu item, so we don't paint all items.
                // The correct behaviour would be to set the new item with the CSS
                // active state as well, but button-press-event is not triggered,
                // so we should track it in our own, which would involve some work
                // in the container
                this.actor.remove_style_pseudo_class('active');
            }
            this.notify('active');
        }
    }

    removeButtonsAndLabels() {
        for (let i = 0, len = this.labels.length; i < len; i++) {
            this.actor.remove_child(this.labels[i]);
        }
        for (let i = 0, len = this.buttons.length; i < len; i++) {
            this.actor.remove_child(this.buttons[i]);
        }
    }

    restoreButtonsAndLabels() {
        const LABELS_POSITION = 2;
        for (let i = 0, len = this.labels.length; i < len; i++) {
            this.actor.insert_child_at_index(this.labels[i], i + LABELS_POSITION);
        }
        for (let i = 0, len = this.buttons.length; i < len; i++) {
            this.actor.insert_child_at_index(this.buttons[i], i + LABELS_POSITION + this.labels.length);
        }
    }

    exitEditMode() {
        this.highlighter.set_text(this.task.text);
        this.label = this.highlighter;
        this.actor.remove_child(this.editTask);
        const TASK_POSITION = 1;
        this.actor.insert_child_at_index(this.label, TASK_POSITION);
        this.restoreButtonsAndLabels();
        this.setSensitive(true);
        this.grabHelper.ungrab({actor: this.editTask});
        this.editTask = null;
    }

    enterEditMode() {
        const oldTask = this.task;
        this.removeButtonsAndLabels();
        this.actor.remove_child(this.label);
        this.setSensitive(false);
        this.editTask = new St.Entry({
            name: 'editTask',
            text: this.task.toString(),
            track_hover: true,
            can_focus: true,
            x_expand: true
        });
        this.editTask.set_primary_icon(new St.Icon({
            icon_name: 'document-save-symbolic',
            icon_size: 14
        }));
        this.editTask.set_secondary_icon(new St.Icon({
            icon_name: 'edit-delete-symbolic',
            icon_size: 14
        }));
        this.editTask.connect('primary-icon-clicked', () => {
            this.taskActions.editAction(oldTask, new JsTodo.TodoTxtItem(this.editTask.get_text()));
            this.exitEditMode();
        });
        this.editTask.connect('secondary-icon-clicked', () => this.exitEditMode());
        this.editTask.clutter_text.connect('key-press-event', (_actor, event) => {
            const symbol = event.get_key_symbol();
            if (symbol === Clutter.KEY_Return || symbol === Clutter.KEY_KP_Enter || symbol ===
                Clutter.KEY_ISO_Enter) {
                this.taskActions.editAction(oldTask, new JsTodo.TodoTxtItem(this.editTask.get_text()));
                return Clutter.EVENT_STOP;
            }
            if (symbol === Clutter.KEY_Escape) {
                this.exitEditMode();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
        const EDIT_TASK_FIELD_POSITION = 1;
        this.actor.insert_child_at_index(this.editTask, EDIT_TASK_FIELD_POSITION);
        this.grabHelper.grab({
            actor: this.editTask,
            onUngrab: () => this.exitEditMode()
        });
        this.editTask.clutter_text.grab_key_focus();
    }

    _createYesButton() {
        const iconNames = [
            'emblem-ok-symbolic',
            'stock_yes-symbolic',
            'gtk-yes-symbolic',
            'dialog-yes-symbolic',
            'gtk-ok-symbolic',
            'stock_yes',
            'gtk-yes',
            'dialog-yes',
            'gtk-ok'
        ];

        return this._createButton(iconNames,
            _('Delete %(task)'.replace('%(task)', this.task.text)), true);
    }

    _createNoButton() {
        const iconNames = [
            'cancel-symbolic',
            'gtk-cancel-symbolic',
            'button_cancel-symbolic',
            'gtk-no-symbolic',
            'dialog-no-symbolic',
            'edit-undo-symbolic',
            'edit-clear-symbolic',
            'cancel',
            'gtk-cancel',
            'button_cancel',
            'gtk-no',
            'dialog-no',
            'edit-undo',
            'edit-clear'
        ];

        return this._createButton(iconNames,
            _('Undo delete %(task)'.replace('%(task)', this.task.text)), true);
    }


    enterDeleteMode() {
        if (this.settings.get('confirm-delete')) {
            this.removeButtonsAndLabels();
            this.actor.remove_child(this.label);
            this.setSensitive(false);
            this.deleteLabel = new St.Label({
                text: _("Are you sure?"),
                x_expand: true
            });
            const confirmStyle = 'color: #F00; font-weight: bold; font-style: italic';
            this.deleteLabel.set_style(confirmStyle);
            this.yesButton = this._createYesButton();
            this.noButton = this._createNoButton();
            this.yesButton.set_style(confirmStyle);
            this.noButton.set_style(confirmStyle);
            this.yesButton.connect('clicked', () => {
                this.taskActions.deleteAction(this.task);

            });
            this.noButton.connect('clicked', () => {
                this.actor.remove_child(this.yesButton);
                this.actor.remove_child(this.noButton);
                this.actor.remove_child(this.deleteLabel);
                const TASK_POSITION = 1;
                this.actor.insert_child_at_index(this.label, TASK_POSITION);
                this.restoreButtonsAndLabels();
                this.setSensitive(true);

            });
            this.actor.add_child(this.deleteLabel);
            this.actor.add_child(this.yesButton);
            this.actor.add_child(this.noButton);
            return;
        }
        this.taskActions.deleteAction(this.task);
    }
});

/* vi: set expandtab tabstop=4 shiftwidth=4: */
