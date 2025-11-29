import GObject from 'gi://GObject';
import St from 'gi://St';
import {PopupBaseMenuItem} from 'resource:///org/gnome/shell/ui/popupMenu.js';
import '../third_party/jsTodoTxt/jsTodoTxt.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export const NewTaskEntry = GObject.registerClass({
    GTypeName: 'NewTaskEntry'
}, class extends PopupBaseMenuItem {
    _init(manager, params) {
        // eslint-disable-next-line no-restricted-syntax
        super._init(params);
        this.stEntry = new St.Entry({
            name: 'newTaskEntry',
            hint_text: _("New task…"),
            track_hover: true,
            can_focus: true
        });

        this.add_style_class_name('newTaskSection');
        this.stEntry.add_style_class_name('newTaskEntry');

        const tasksMenu = manager.menu;
        const entryNewTask = this.stEntry.clutter_text;

        entryNewTask.connect('activate', origin => {
            const text = origin.get_text();
            origin.set_text('');
            if (!manager.keepOpenAfterNew) {
                tasksMenu.close();
            }
            if (text === '') {
                return;
            }
            manager.topbar.update({
                busy: true
            });
            const newTask = new window.TodoTxtItem(text, this.enabledExtensions);
            manager.decorator.addLoggingToNamespace(newTask);
            manager.addTask(newTask);
        });
        this.add_child(this.stEntry);
    }

    grab_key_focus() {
        this.stEntry.grab_key_focus();
    }
});

/* vi: set expandtab tabstop=4 shiftwidth=4: */
