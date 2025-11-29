import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';

import { SettingsType } from './settingsType.js';

export class ShortcutType extends SettingsType {
    get_widget() {
        return 'shortcut';
    }

    get_row() {
        return this.get_widget();
    }

    extra(params) {
        const accelerator_label = params.builder.get_object(`${params.setting}-shortcut-accelerator-label`);
        if (accelerator_label === null) {
            params.logger.error(`No accelerator_label for ${params.setting}`);
            return;
        }
        accelerator_label.set_text(params.settings.get(params.setting));
        params.widget.connect('activated', (_object) => {
            this._selectShortcut(params.setting, params.settings, accelerator_label, params.builder, params.logger);
        });
    }

    additional_templates() {
        return ['preferences/ui/shortcutEditor.xml'];
    }

    _selectShortcut(shortcut, settings, label, builder, logger) {
        const dialog = builder.get_object('shortcut-editor-dialog');
        if (dialog === null) {
            logger.error(`No dialog for ${shortcut}`);
            return;
        }
        const controller = builder.get_object('shortcut-editor-event-controller');
        if (controller === null) {
            logger.error(`No controller for ${shortcut}`);
            return;
        }
        const accelerator_label = builder.get_object(`${shortcut}-shortcut-accelerator-label`);
        if (accelerator_label === null) {
            logger.error(`No accelerator_label for ${shortcut}`);
            return;
        }
        accelerator_label.set_text(settings.get(shortcut));
        controller.connect('key-pressed', (_widget, keyval, keycode, state) => {
            let mask = state & Gtk.accelerator_get_default_mod_mask();
            mask &= ~Gdk.ModifierType.LOCK_MASK;

            if (mask === 0 && keyval === Gdk.KEY_Escape) {
                logger.info(`${shortcut} not changed`);
                dialog.close();
                return Gdk.EVENT_STOP;
            }

            if (mask === 0 && keyval === Gdk.KEY_BackSpace) {
                settings.set(shortcut, '');
                label.set_text('');
                dialog.close();
                return Gdk.EVENT_STOP;
            }

            if (
                !this.isBindingValid({ mask, keycode, keyval }) ||
                !this.isAccelValid({ mask, keyval })
            ) {
                return Gdk.EVENT_STOP;
            }


            const keybinding = Gtk.accelerator_name_with_keycode(
                null,
                keyval,
                keycode,
                mask
            );
            settings.set(shortcut, keybinding);
            label.set_text(keybinding);
            dialog.close();
            return Gdk.EVENT_STOP;
        });
        dialog.present();
    }

    isAccelValid({ mask, keyval }) {

        return Gtk.accelerator_valid(keyval, mask) || (keyval === Gdk.KEY_Tab && mask !== 0);
    }

    isKeyvalForbidden(keyval) {
        const forbiddenKeyvals = [
            Gdk.KEY_Home,
            Gdk.KEY_Left,
            Gdk.KEY_Up,
            Gdk.KEY_Right,
            Gdk.KEY_Down,
            Gdk.KEY_Page_Up,
            Gdk.KEY_Page_Down,
            Gdk.KEY_End,
            Gdk.KEY_Tab,
            Gdk.KEY_KP_Enter,
            Gdk.KEY_Return,
            Gdk.KEY_Mode_switch,
        ];
        return forbiddenKeyvals.includes(keyval);
    }

    /* eslint-disable complexity */
    isBindingValid({ mask, keycode, keyval }) {
        if ((mask === 0 || mask === Gdk.SHIFT_MASK) && keycode !== 0) {
            if (
                (keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
                (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
                (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
                (keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound) ||
                (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun) ||
                (keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN) ||
                (keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega) ||
                (keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf) ||
                (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao) ||
                (keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh) ||
                (keyval === Gdk.KEY_space && mask === 0) ||
                this.isKeyvalForbidden(keyval)
            ) {
                return false;
            }
        }
        return true;
    /* eslint-enable complexity */
    }

}
/* vi: set expandtab tabstop=4 shiftwidth=4: */
