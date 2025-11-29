import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';
import {ModalDialog} from 'resource:///org/gnome/shell/ui/modalDialog.js';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export const MessageDialog = GObject.registerClass({
    GTypeName: 'MessageDialog',
    Signals: { 'opened': {}, 'closed': {} }
}, class extends ModalDialog {

    _init(title, message) {
        // eslint-disable-next-line no-restricted-syntax
        super._init({
            styleClass: 'message-dialog'
        });

        this.message = message;
        this.title = title;

        const tlabel = new St.Label({
            style_class: 'message-dialog-title',
            text: this.title,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });
        this.contentLayout.add(tlabel);

        const label = new St.Label({
            style_class: 'message-dialog-label',
            text: this.message,
            y_align: St.Align.MIDDLE
        });
        label.clutter_text.line_wrap = true;
        this.contentLayout.add(label);

        const buttons = [{
            label: _("Ok"),
            action: () => this._onOkButton(),
            key: Clutter.Return
        }];
        this.setButtons(buttons);
    }

    close() {
        super.close();
    }

    _onOkButton() {
        this.close();
    }

    open() {
        super.open();
    }
});

/* vi: set expandtab tabstop=4 shiftwidth=4: */
