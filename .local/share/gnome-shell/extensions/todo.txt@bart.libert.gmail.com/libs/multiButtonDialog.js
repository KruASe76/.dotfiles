import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';
import St from 'gi://St';
import GObject from 'gi://GObject';
import {getDefaultIfInvalid as valueOrDefault} from './utils.js'

export class ButtonMapping {
    constructor(label, key, action) {
        this.label = valueOrDefault(label, null);
        this.key = valueOrDefault(key, null);
        this.action = valueOrDefault(action, null);
    }
}

export const MultiButtonDialog = GObject.registerClass({
    GTypeName: 'MultiButtonDialog',
    Signals: { 'opened': {}, 'closed': {} }
}, class extends ModalDialog.ModalDialog {
    _init(title, question, buttonMappings) {
        // eslint-disable-next-line no-restricted-syntax
        super._init({
            styleClass: 'confirm-dialog'
        });
        this.question = valueOrDefault(question, null);
        this.title = valueOrDefault(title, null);

        const tlabel = new St.Label({
            style_class: 'confirm-dialog-title',
            text: this.title,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });
        this.contentLayout.add(tlabel);

        const label = new St.Label({
            style_class: 'confirm-dialog-label',
            text: this.question,
            y_align: St.Align.MIDDLE
        });
        this.contentLayout.add(label);

        const buttons = [];
        for (const i in buttonMappings) {
            /*jshint loopfunc: true */
            if (Object.prototype.hasOwnProperty.call(buttonMappings,i)) {
                const mapping = buttonMappings[i];
                buttons.push({
                    label: mapping.label,
                    key: mapping.key,
                    action: () => {
                        if (mapping.action !== null) {
                            mapping.action();
                        }
                        this.close();
                    }
                });
            }
        }

        this.setButtons(buttons);
    }
});

/* vi: set expandtab tabstop=4 shiftwidth=4: */
