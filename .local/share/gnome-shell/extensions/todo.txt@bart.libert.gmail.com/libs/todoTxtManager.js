// This extension was developed by Bart Libert
//
// Based on code by :
// * Baptiste Saleil http://bsaleil.org/
// * Arnaud Bonatti https://github.com/Obsidien
//
// Licence: GPLv2+
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {PopupMenuItem, PopupSubMenuMenuItem} from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Errors from './errors.js';
import * as JsTextFile from './jsTextFile.js';
import * as Message from './messageDialog.js';
import * as MultiButtonDialog from './multiButtonDialog.js';
import { NewTaskEntry } from './newTaskEntry.js';
import { OpenPreferencesEntry } from './openPreferencesEntry.js';
import { OpenTextEditorEntry } from './openTextEditorEntry.js';
import { ScrollablePopupMenu } from './scrollablePopupMenu.js';
import { Settings } from './settings.js';
import * as Shared from './sharedConstants.js';
import { TodoMenuItem } from './todoMenuItem.js';
import { TodoTopBar as TopBar } from './topBar.js';
import * as Utils from './utils.js';

import { LogDecorator as Decorator } from '../third_party/logDecorator/logDecorator.js';
import { TodoTxtItem } from '../third_party/jsTodoTxt/jsTodoTxt.js';
import { DueExtension, HiddenExtension } from '../third_party/jsTodoTxt/jsTodoExtensions.js';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const schema = 'org.gnome.shell.extensions.TodoTxt';
const openKey = 'open-key';

const TodoTxtButton = GObject.registerClass({
    GTypeName: 'TodoTxtButton'
}, class TodoTxtButton extends PanelMenu.Button {

    _init(params) {
        super._init(0, 'todo.txt', true);
        this.settings = null;
        this.autoarchive = false;
        this.debugLevel = Shared.LOG_ERROR;
        this.groupBy = null;
        this.groupUngrouped = false;
        this.monitor = null;
        this.volumeMonitor = null;
        this.linkMonitor = null;
        this.fileLoaded = false;
        this.enabledExtensions = [];
        this.keepOpenAfterNew = true;
        this.insertTaskAtTop = false;
        this.schema = schema;
        this.logger = params.logger;
        this.extension = params.extension;
        this._initSettings(params);
        this._loadSettings();

        this.logger.level = this.debugLevel;

        this.decorator = new Decorator();
        this.decorator.logger = this.logger.flow;

        this.popupMenu = new ScrollablePopupMenu(this, 0, St.Side.TOP, this.logger);
        this.decorator.addLoggingToNamespace(this.popupMenu);

        this.setMenu(this.popupMenu);

        this.tasks = [];
        this.groupedTasksParameter = [];
        this.groupedTasksParameter[Shared.NO_GROUPING] = '';
        this.groupedTasksParameter[Shared.GROUP_BY_PROJECTS] = 'projects';
        this.groupedTasksParameter[Shared.GROUP_BY_CONTEXTS] = 'contexts';

        this.topbar = new TopBar({
            initialText: '[…]',
            logger: this.logger,
            decorator: this.decorator,
            taskInfoProvider: this,
            settings: this.settings
        });
        this.decorator.addLoggingToNamespace(this.topbar);

        this.topbar.update({
            busy: true
        });

        this.add_child(this.topbar);

        this._installShortcuts();

        this._refresh();
    }

    getNbOfUnarchivedTasks() {
        if (this.tasks === null) {
            return 0;
        }
        return this.tasks.length;
    }

    getNbOfUndoneTasks() {
        let count = 0;
        for (let i = 0, len = this.tasks.length; i < len; i++) {
            if (!this.tasks[i].complete) {
                count++;
            }
        }
        return count;
    }

    getNbOfHiddenTasks() {
        let count = 0;
        for (let i = 0, len = this.tasks.length; i < len; i++) {
            if (this._isHiddenTodoItem(this.tasks[i])) {
                count++;
            }
        }
        return count;
    }

    _createNewTaskEntry() {
        this.newTask = new NewTaskEntry(this);
    }

    _isHiddenTodoItem(task) {
        return task.hidden ||
            this.onlyShowPrioritiesAbove !== '' &&
            (task.priority === null || task.priority > this.onlyShowPrioritiesAbove) ||
            !this.showDoneTasks && task.complete;
    }

    _createTodoItem(task) {
        if (this._isHiddenTodoItem(task)) {
            return null;
        }
        const actions = {
            doneAction: (taskToComplete) => {
                this.topbar.update({
                    busy: true
                });
                this.completeTask(taskToComplete);
            },
            archiveAction: (taskToArchive) => {
                this.topbar.update({
                    busy: true
                });
                this.archiveTask(taskToArchive);
            },
            deleteAction: (taskToDelete) => {
                this.topbar.update({
                    busy: true
                });
                this.removeTask(taskToDelete);
            },
            editAction: (oldTask, newTask) => {
                this.modifyTask(oldTask, newTask, true);
            },
            priorityAction: (taskToModify, up) => {
                this.topbar.update({
                    busy: true
                });
                this.modifyTaskPriority(taskToModify, up);
            }
        };
        return new TodoMenuItem(task, this.settings, actions);
    }

    _initSettings(params) {
        this.settings = new Settings(params);
    }

    _loadSettings() {
        this.todofile = this.settings.get('todotxt-location');
        this.donefile = this.settings.get('donetxt-location');
        this.autoarchive = this.settings.get('auto-archive');
        this.debugLevel = this.settings.get('debug-level');
        this.groupBy = this.settings.get('group-by');
        this.groupUngrouped = this.settings.get('group-ungrouped');
        this.showNewTaskEntry = this.settings.get('show-new-task-entry');
        this.addCreationDate = this.settings.get('add-creation-date');
        this.showOpenInTextEditor = this.settings.get('show-open-in-text-editor');
        this.priorityOnDone = this.settings.get('priority-on-done');
        this.showNumberOfGroupElements = this.settings.get('show-number-of-group-elements');
        this.hiddenExtension = this.settings.get('enable-hidden-extension');
        this.keepOpenAfterNew = this.settings.get('keep-open-after-new');
        this.insertTaskAtTop = (this.settings.get('task-insert-location') === Shared.TASK_INSERT_LOCATION_TOP);
        this.orderByPriority = this.settings.get('order-by-priority');
        this.onlyShowPrioritiesAbove = this.settings.get('only-show-priority-above').trim().toUpperCase();
        this.showDoneTasks = this.settings.get('show-done');
        this.showOpenPreferences = this.settings.get('show-open-preferences');
        this.dueDateExtension = this.settings.get('enable-due-date-extension');
        this.commentsExtension = this.settings.get('enable-comments-extension');
    }

    _connectSettingsSignals() {
        this.settings.registerForChange('auto-archive', this.onParamChanged.bind(this));
        this.settings.registerForChange('todotxt-location', this.onTodoFileChanged.bind(this));
        this.settings.registerForChange('donetxt-location', this.onParamChanged.bind(this));
        this.settings.registerForChange('debug-level', this.onParamChanged.bind(this));
        this.settings.registerForChange('group-by', this.onParamChanged.bind(this));
        this.settings.registerForChange('group-ungrouped', this.onParamChanged.bind(this));
        this.settings.registerForChange('priorities-markup', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-done-or-archive-button', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-delete-button', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-projects-label', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-contexts-label', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-new-task-entry', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-open-in-text-editor', this.onParamChanged.bind(this));
        this.settings.registerForChange('style-priorities', this.onParamChanged.bind(this));
        this.settings.registerForChange('add-creation-date', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-edit-button', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-priority-buttons', this.onParamChanged.bind(this));
        this.settings.registerForChange('click-action', this.onParamChanged.bind(this));
        this.settings.registerForChange('open-key', this.onShortcutChanged.bind(this));
        this.settings.registerForChange('confirm-delete', this.onParamChanged.bind(this));
        this.settings.registerForChange('done-task-italic', this.onParamChanged.bind(this));
        this.settings.registerForChange('done-task-bold', this.onParamChanged.bind(this));
        this.settings.registerForChange('done-task-strikethrough', this.onParamChanged.bind(this));
        this.settings.registerForChange('color-done-tasks', this.onParamChanged.bind(this));
        this.settings.registerForChange('custom-done-tasks-color', this.onParamChanged.bind(this));
        this.settings.registerForChange('url-color', this.onParamChanged.bind(this));
        this.settings.registerForChange('custom-url-color', this.onParamChanged.bind(this));
        this.settings.registerForChange('long-tasks-expansion-mode', this.onParamChanged.bind(this));
        this.settings.registerForChange('truncate-long-tasks', this.onParamChanged.bind(this));
        this.settings.registerForChange('long-tasks-max-width', this.onParamChanged.bind(this));
        this.settings.registerForChange('long-tasks-ellipsize-mode', this.onParamChanged.bind(this));
        this.settings.registerForChange('priority-on-done', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-number-of-group-elements', this.onParamChanged.bind(this));
        this.settings.registerForChange('enable-hidden-extension', this.onParamChanged.bind(this));
        this.settings.registerForChange('keep-open-after-new', this.onParamChanged.bind(this));
        this.settings.registerForChange('task-insert-location', this.onParamChanged.bind(this));
        this.settings.registerForChange('order-by-priority', this.onParamChanged.bind(this));
        this.settings.registerForChange('only-show-priority-above', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-done', this.onParamChanged.bind(this));
        this.settings.registerForChange('show-open-preferences', this.onParamChanged.bind(this));
        this.settings.registerForChange('enable-due-date-extension', this.onParamChanged.bind(this));
        this.settings.registerForChange('enable-comments-extension', this.onParamChanged.bind(this));
    }

    _loadExtensions() {
        this.enabledExtensions = [];
        if (this.hiddenExtension) {
            this.enabledExtensions.push(new HiddenExtension());
        }
        if (this.dueDateExtension) {
            this.enabledExtensions.push(new DueExtension());
        }
    }

    _refresh() {
        // Clear
        this.menu.removeAll();
        this.menu.clearSection('top');
        this.menu.clearSection('bottom');

        let todoFile = null;
        // Sync
        try {
            todoFile = new JsTextFile.JsTextFile(this.todofile, this.logger);
        } catch (exception) { // eslint-disable-line no-unused-vars
            this.logger.info('File could not be read, showing \'no file\' menu');
            this._createNoFileMenu('todo.txt');
            return false;
        }

        this.decorator.addLoggingToNamespace(todoFile);
        if (!todoFile.exists()) {
            return false;
        }

        this._loadExtensions();

        this._createTasksFromFile(todoFile.lines);

        this._createTasksMenu();

        this.topbar.update();

        if (this.showNewTaskEntry) {
            let section = 'bottom';
            if (this.insertTaskAtTop === true) {
                section = 'top';
            }
            this._createNewTaskEntry();
            this.menu.addToSection(section, this.newTask);
            this.menu.connect('open-state-changed', (open) => {
                if (open) {
                    this.newTask.grab_key_focus();
                }
            });
        }

        if (this.showOpenInTextEditor) {
            this.menu.addToSection('bottom', new OpenTextEditorEntry(this));
        }

        if (this.showOpenPreferences) {
            this.menu.addToSection('bottom', new OpenPreferencesEntry(this));
        }

        if (this.menu.isOpen) {
            this.newTask.grab_key_focus();
        }
        return true;
    }

    _addTasksToMain(tasks) {
        if (this.orderByPriority) {
            tasks.sort(this.sortByPriority);
        }
        for (let i = 0; i < tasks.length; i++) {
            const item = this._createTodoItem(tasks[i]);
            if (item !== null) {
                this.menu.addMenuItem(item);
            }
        }
    }

    _createTaskGroups() {
        const groupedTasks = {};
        for (let i = 0; i < this.tasks.length; i++) {
            this._createGroupedTask(this.tasks[i], groupedTasks);
        }
        return groupedTasks;
    }

    _sortTaskGroups(groupedTasks) {
        for (const groupArray in groupedTasks) {
            if (Object.prototype.hasOwnProperty.call(groupedTasks, groupArray)) {
                if (this.orderByPriority) {
                    groupedTasks[groupArray].sort(this.sortByPriority);
                }
            }
        }
    }

    _createGroupSubMenu(name, tasks) {
        const groupItem = new PopupSubMenuMenuItem(name);
        groupItem.setActive = (active) => {
            const activeChanged = active !== this.active;
            if (activeChanged) {
                this.active = active;
                if (active) {
                    this.add_style_class_name('selected');
                } else {
                    this.remove_style_class_name('selected');
                    // Remove the CSS active state if the user press the button and
                    // while holding moves to another menu item, so we don't paint all items.
                    // The correct behaviour would be to set the new item with the CSS
                    // active state as well, but button-press-event is not triggered,
                    // so we should track it in our own, which would involve some work
                    // in the container
                    this.remove_style_pseudo_class('active');
                }
                this.emit('active-changed', active);
            }
        };
        for (let i = 0; i < tasks.length; i++) {
            const item = this._createTodoItem(tasks[i]);
            if (item !== null) {
                groupItem.menu.addMenuItem(item);
            }
        }
        return groupItem;
    }

    _createTasksMenu() {
        if (this.groupBy === Shared.NO_GROUPING) {
            this._addTasksToMain(this.tasks);
            return;
        }
        const groupedTasks = this._createTaskGroups();
        this._sortTaskGroups(groupedTasks);
        for (const group in groupedTasks) {
            if (Object.prototype.hasOwnProperty.call(groupedTasks, group)) {
                let groupItem = null;
                if (group === '"__nogroup__"') {
                    if (this.groupUngrouped) {
                        groupItem = this._createGroupSubMenu(_("Ungrouped"), groupedTasks[group]);
                    } else {
                        this._addTasksToMain(groupedTasks[group]);
                        continue;
                    }
                } else {
                    groupItem = this._createGroupSubMenu(group.replace(/^"/, '').replace(/"$/, ''),
                        groupedTasks[group]);
                }
                if (this.showNumberOfGroupElements) {
                    groupItem.label.text += ` (${groupedTasks[group].length})`;
                }
                this.menu.addMenuItem(groupItem);
            }
        }
    }

    _createTasksFromFile(lines) {
        this.tasks.length = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i] !== '' && lines[i] !== '\n') {
                try {
                    if (this.commentsExtension && /^#/.test(lines[i])) {
                        continue
                    }

                    const task = new TodoTxtItem(lines[i], this.enabledExtensions);
                    this.decorator.addLoggingToNamespace(task);
                    this.tasks.push(task);
                } catch (exception) {
                    this.logger.debug(`Error while reading task: ${exception.message}`);
                }
            }

        }
    }

    _createGroupedTask(task, groupedTasks) {
        let groups = task[this.groupedTasksParameter[this.groupBy]];
        if (groups === null) {
            groups = ['__nogroup__'];
        }
        for (const group in groups) {
            if (Object.prototype.hasOwnProperty.call(groups, group)) {
                const groupName = `"${groups[group]}"`;
                if (typeof groupedTasks[groupName] === 'undefined') {
                    groupedTasks[groupName] = [task];
                } else {
                    groupedTasks[groupName].push(task);
                }
            }
        }
    }

    _get_symlink_target_absolute(symlinkGFile) {
        this.logger.debug(`Getting absolute path for symlink ${symlinkGFile.get_path()}`);
        let parentDir = symlinkGFile.get_parent();
        if (parentDir === null) {
            parentDir = Gio.file_new_for_path('/');
        }
        const symlinkTarget =
            symlinkGFile.query_info('standard::symlink-target', Gio.FileQueryInfoFlags.NONE, null).get_symlink_target();
        return parentDir.resolve_relative_path(symlinkTarget);
    }

    _linkChanged() {
        if (this._monitorFile()) {
            this._refresh();
        }
    }

    _create_link_monitor_if_necessary(path) {
        if (!Utils.isValid(path)) {
            return null;
        }
        const gFile = Gio.file_new_for_path(path);
        if (gFile.query_info('standard::is-symlink', Gio.FileQueryInfoFlags.NONE, null).get_is_symlink()) {
            if (this.linkMonitor !== null) {
                this.linkMonitor.cancel();
            }
            this.linkMonitor = gFile.monitor(Gio.FileMonitorFlags.NONE, null);
            this.linkMonitor.connect('changed', this._linkChanged.bind(this));
            return this._get_symlink_target_absolute(gFile);
        }
        return null;
    }

    _get_g_file_for_path(path) {
        const gFile = Gio.file_new_for_path(path);
        if (!gFile.query_exists(null)) {
            return gFile;
        }
        const hardLink = this._create_link_monitor_if_necessary(path);
        if (hardLink !== null) {
            return hardLink;
        }
        return gFile;
    }

    _launchPreferences() {
        this.extension.openPreferences();
    }

    _getDefaultConfigPath() {
        return GLib.build_pathv('/', [GLib.get_user_data_dir(), 'todo.txt']);
    }

    _fileExists(file) {
        if (GLib.file_test(file, GLib.FileTest.EXISTS)) {
            return true;
        }
        return false;
    }

    _createDefaultFileOrReuseExisting(path, fileName, setting) {
        const file = GLib.build_filenamev([path, fileName]);
        if (!this._fileExists(file)) {
            GLib.file_set_contents(file, '');
            this.settings.set(setting, file);
            return;
        }
        const useExistingButton = new MultiButtonDialog.ButtonMapping(_("Use existing file"), null,
            () => {
                this.logger.debug('Using existing file');
                this.settings.set(setting, file);
            });
        const overwriteExistingButton = new MultiButtonDialog.ButtonMapping(_("Create new file"), null,
            () => {
                this.logger.debug('Creating new file');
                GLib.file_set_contents(file, '');
                this.settings.set(setting, file);
            });
        const openSettingsButton = new MultiButtonDialog.ButtonMapping(_("Open settings"), Clutter.Return,
            () => {
                this._launchPreferences();
            });
        const cancelButton = new MultiButtonDialog.ButtonMapping(_("Cancel"), Clutter.Escape, null);
        const buttons = [useExistingButton, overwriteExistingButton, openSettingsButton, cancelButton];
        const dialog = new MultiButtonDialog.MultiButtonDialog(
            _("%(file) exists already").replace('%(file)', file),
            _("Please choose what you want to do"),
            buttons
        );
        dialog.open();
    }

    _createDefaultFiles() {
        const createPath = this._getDefaultConfigPath();
        const MODE = 493;
        GLib.mkdir_with_parents(createPath, MODE);
        this._createDefaultFileOrReuseExisting(createPath, 'todo.txt', 'todotxt-location');
        this._createDefaultFileOrReuseExisting(createPath, 'done.txt', 'donetxt-location');
    }

    _createNoFileMenu(file) {
        this.topbar.update({
            error: true
        });
        const errorItem = new PopupMenuItem(
            _("No valid %(filename) file specified").replace('%(filename)', file));
        const chooseItem = new PopupMenuItem(`> ${_("Select location in settings")}`);
        chooseItem.connect('activate', () => {
            this._launchPreferences();
        });
        const createItem = new PopupMenuItem(`> ${_(
            "Create todo.txt and done.txt file in %(path)").replace(
            '%(path)', this._getDefaultConfigPath())}`);
        createItem.connect('activate', () => {
            this._createDefaultFiles();
        });
        this.menu.removeAll();
        this.menu.clearSection('top');
        this.menu.clearSection('bottom');
        this.menu.addMenuItem(errorItem);
        this.menu.addMenuItem(chooseItem);
        this.menu.addMenuItem(createItem);
    }

    _monitored() {
        if (this._checkForFile()) {
            this._refresh();
        }
    }

    _mountChanged() {
        this.logger.debug('Mount changed, checking if file exists');
        if (this._checkForFile()) {
            this._refresh();
        }
    }

    _monitorMounts() {
        this.volumeMonitor = Gio.VolumeMonitor.get();
        this.volumeMonitor.connect('mount-added', this._mountChanged.bind(this));
        this.volumeMonitor.connect('mount-removed', this._mountChanged.bind(this));
    }

    _checkForFile() {
        try {
            const jsTextFile = new JsTextFile.JsTextFile(this.todofile, this.logger);
            this.decorator.addLoggingToNamespace(jsTextFile);
            this.logger.debug(`File found: ${this.todofile}`);
            if (this.fileLoaded === false) {
                this._create_link_monitor_if_necessary(this.todofile);
            }
            this.fileLoaded = true;
            return true;
        } catch (exception) { // eslint-disable-line no-unused-vars
            this.logger.info('File could not be monitored, showing \'no file\' menu');
            this._createNoFileMenu('todo.txt');
            this.fileLoaded = false;
            return false;
        }
    }

    _monitorFile() {
        this._cancel_monitors();
        const fileM = this._get_g_file_for_path(this.todofile);
        this.logger.debug(`Monitoring ${fileM.get_path()}`);
        this.monitor = fileM.monitor(Gio.FileMonitorFlags.WATCH_MOUNTS | Gio.FileMonitorFlags.WATCH_MOVES,
            null);
        this.monitor.connect('changed', this._monitored.bind(this));
        if (this._checkForFile()) {
            this._refresh();
        }
    }

    enable() {
        const menuManager = Main.panel._menus || Main.panel.menuManager;
        menuManager.addMenu(this.menu);

        this._monitorFile();
        this._monitorMounts();
        this._connectSettingsSignals();
    }

    _cancel_monitors() {
        if (this.monitor !== null) {
            if (!this.monitor.cancel()) {
                this.debug.error('Could not cancel file monitor');
            }
            this.monitor = null;
        }
        if (this.linkMonitor !== null) {
            if (!this.linkMonitor.cancel()) {
                this.debug.error('Could not cancel link monitor');
            }
            this.linkMonitor = null;
        }
    }

    disable() {
        const menuManager = Main.panel._menus || Main.panel.menuManager;
        menuManager.removeMenu(this.menu);
        this._cancel_monitors();
        global.display.remove_keybinding(openKey);
        this.settings.unregisterCallbacks();
    }

    destroy() {
        if (this.menu !== null) {
            this.menu.removeAll();
            this.menu.destroy();
            this.menu = null;
            super.destroy();
        }
    }

    onTodoFileChanged() {
        this._loadSettings();
        this._cancel_monitors();
        if (this._monitorFile()) {
            this._refresh();

        }
    }

    onParamChanged(_self, key) {
        this.logger.debug(`${key} has changed to ${this.settings.get(key)}`);
        if (key === 'auto-archive') {
            this.autoarchive = this.settings.get('auto-archive');
            return;
        }
        if (key === 'donetxt-location') {
            this.donefile = this.settings.get('donetxt-location');
            this._refresh();
            return;
        }
        if (key === 'debug-level') {
            this.debugLevel = this.settings.get('debug-level');
            this.logger.level = this.debugLevel;
            return;
        }
        if (key === 'add-creation-date') {
            this.addCreationDate = this.settings.get('add-creation-date');
            return;
        }
        if (key === 'priority-on-done') {
            this.priorityOnDone = this.settings.get('priority-on-done');
            return;
        }
        if (key === 'keep-open-after-new') {
            this.keepOpenAfterNew = this.settings.get('keep-open-after-new');
            return;
        }
        this._loadSettings();
        this._refresh();
    }

    _addKeyBinding(key, keyFunction) {
        if (Main.wm.addKeybinding) {
            let mode = Shell.ActionMode;
            if (typeof mode === 'undefined') {
                mode = Shell.KeyBindingMode;
            }
            Main.wm.addKeybinding(key, this.settings.getGioSettings(), Meta.KeyBindingFlags.NONE,
                mode.ALL, keyFunction);
            return;
        }
        global.display.add_keybinding(key, this.settings.getGioSettings(), Meta.KeyBindingFlags.NONE,
            keyFunction);
    }

    _removeKeyBinding(key) {
        if (Main.wm.removeKeybinding) {
            Main.wm.removeKeybinding(key);
        } else {
            global.display.remove_keybinding(key);
        }
    }

    _installShortcuts() {
        this._addKeyBinding(openKey, () => {
            this.menu.open();
        });
    }

    onShortcutChanged() {
        this._removeKeyBinding(openKey);
        this._installShortcuts();
        this._loadSettings();
    }

    removeTask(task) {
        const index = this.tasks.indexOf(task);
        if (index === -1) {
            this.logger.debug('Task not found');
            return false;
        }
        const NUMBER_OF_LINES_TO_REMOVE = 1;
        this.tasks.splice(index, NUMBER_OF_LINES_TO_REMOVE);
        return this.saveTasksToFile();
    }

    addTask(task) {
        if (this.addCreationDate) {
            task.date = new Date();
        }
        if (this.insertTaskAtTop === true) {
            this.tasks.unshift(task);
        } else {
            this.tasks.push(task);
        }
        return this.saveTasksToFile();
    }

    modifyTask(oldTask, newTask, save) {
        const index = this.tasks.indexOf(oldTask);
        if (index === -1) {
            this.logger.debug('Task not found');
            return false;
        }
        this.tasks[index] = newTask;
        if (save) {
            return this.saveTasksToFile();
        }
        return true;
    }

    _modifyTaskPriorityOnComplete(task) {
        if (this.priorityOnDone === Shared.TASK_DONE_PRIORITY_REMOVE) {
            task.priority = null;
            return;
        }
        if (this.priorityOnDone === Shared.TASK_DONE_PRIORITY_KEEP_PRI) {
            task.text += ` pri:${task.priority}`;
            task.priority = null;

        }
    }

    completeTask(task) {
        const doneTask = new TodoTxtItem(task.toString(), this.enabledExtensions);
        this.decorator.addLoggingToNamespace(doneTask);
        doneTask.complete = true;
        doneTask.completed = new Date();
        if (doneTask.priority !== null) {
            this._modifyTaskPriorityOnComplete(doneTask);
        }
        // Modify tasks list, but don't save yet
        if (!this.modifyTask(task, doneTask, false)) {
            return false;
        }
        // If autoarchive is on, archive task and save both files
        if (this.autoarchive) {
            return this.archiveTask(doneTask);
        }
        // If autoarchive is off, only save todo.txt file
        return this.saveTasksToFile();
    }

    archiveTask(task) {
        if (!task.complete) {
            this.logger.debug('archiveTask: trying to archive task that is not done');
            return false;
        }
        try {
            const jsTextFile = new JsTextFile.JsTextFile(this.donefile, this.logger);

            this.decorator.addLoggingToNamespace(jsTextFile);
            if (!jsTextFile.addLine(task.toString(), this.insertTaskAtTop)) {
                this.logger.debug('Could not add task to done file');
            }
            jsTextFile.saveFile(true);
            return this.removeTask(task);
        } catch (exception) {
            const title = _("Error writing file");
            let message = null;
            if (exception.type === Errors.TodoTxtErrorTypes.FILE_WRITE_PERMISSION_ERROR ||
                exception.type === Errors.TodoTxtErrorTypes.FILE_WRITE_ERROR) {
                message = new Message(title, exception.message);
            } else if (exception instanceof Errors.IoError) {
                this._createNoFileMenu('done.txt');
            } else {
                message = new Message(title,
                    _("Unknown error during file write: %(error)").replace('%(error)', exception.toString())
                );
            }
            message.open();
        }
        return false;
    }

    _traverseChars(char, prev) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        if (char === chars.charAt(0) && prev) {
            return chars.charAt(chars.length - 1);
        }
        if (char === chars.charAt(chars.length - 1) && !prev) {
            return chars.charAt(0);
        }
        if ((typeof char === 'undefined' || char === null) && prev) {
            this.logger.debug(`undefined char, returning ${chars.charAt(0)}`);
            return chars.charAt(0);
        }
        if ((typeof char === 'undefined' || char === null) && !prev) {
            this.logger.debug(`undefined char, returning ${chars.charAt(chars.length - 1)}`);
            return chars.charAt(chars.length - 1);
        }
        return chars.charAt(chars.indexOf(char) + ((prev === true) ? -1 : 1));

    }

    modifyTaskPriority(task, higher) {
        const newTask = new TodoTxtItem(task.toString(), this.enabledExtensions);
        this.decorator.addLoggingToNamespace(newTask);
        this.logger.debug(`Modify${task.toString()}, higher:${higher}`);
        newTask.priority = this._traverseChars(task.priority, higher);
        return this.modifyTask(task, newTask, true);
    }

    saveTasksToFile() {
        const jsTextFile = new JsTextFile.JsTextFile(this.todofile, this.logger);
        this.decorator.addLoggingToNamespace(jsTextFile);
        const textArray = [];
        for (let i = 0; i < this.tasks.length; i++) {
            textArray[i] = this.tasks[i].toString();
        }
        jsTextFile.lines = textArray;
        try {
            return jsTextFile.saveFile(true);
        } catch (exception) {
            const title = _("Error writing file");
            let message = null;
            if (exception.type === Errors.TodoTxtErrorTypes.FILE_WRITE_PERMISSION_ERROR ||
                exception.type === Errors.TodoTxtErrorTypes.FILE_WRITE_ERROR) {
                message = new Message(title, exception.message);
            } else {
                message = new Message(title, _("Unknown error during file write: %(error)").replace(
                    '%(error)', exception.toString()));
            }
            message.open();
        }
        return false;
    }

    sortByPriority(a, b) {
        const EQUAL = 0;
        const A_SMALLER_THAN_B = 1;
        const A_LARGER_THAN_B = -1;
        if (a.priority === null) {
            if (b.priority === null) {
                return EQUAL;
            }
            // Convention: 'null' has smaller priority then everything else
            return A_SMALLER_THAN_B;
        }
        if (b.priority === null) {
            // Case a==null, b==null already covered
            return A_LARGER_THAN_B;
        }
        return (a.priority.charCodeAt(0) - b.priority.charCodeAt(0));
    }
});

export class TodoTxtManager {
    constructor() {
        this._button = null;
        this._logger = null;
    }

    enable(params) {
        this._logger = Utils.getDefaultLogger();

        const parameters = Object.assign({
            logger: this._logger
        }, params);
        print(parameters.logger)
        this._button = new TodoTxtButton(parameters);
        const decorator = new Decorator();
        decorator.logger = this._logger.flow;
        decorator.addLoggingToNamespace(this._button);
        Main.panel.addToStatusArea('todoTxt', this._button);
        this._button.enable();
    }

    disable() {
        if (this._button !== null) {
            this._button.disable();
        }
        this.destroy();
    }

    destroy() {
        if (this._logger !== null) {
            this._logger = null;
        }
        if (this._button !== null) {
            this._button.destroy();
            this._button = null;
        }
    }
}
/* vi: set expandtab tabstop=4 shiftwidth=4: */
