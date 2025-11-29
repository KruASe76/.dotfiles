import GLib from 'gi://GLib';

import * as Shared from './sharedConstants.js';
import * as Utils from './utils.js'

export class Markup {
    constructor(variant, logger) {
        this.bold = false;
        this.italic = false;
        this.changeColor = false;
        this.color = 'rgb(0,0,0)';
        if (Utils.isValid(logger)) {
            this.logger = logger;
        } else {
            this.logger = Utils.getDefaultLogger();
            this.logger.warning('Using default logger instead of injected one');
        }
        if (!Utils.isValid(variant)) {
            return;
        }
        if (!(variant instanceof GLib.Variant)) {
            this.logger.error(`Markup instantiated with non-variant object of type ${typeof variant}`);
            return;
        }
        const expectedVariant = new GLib.VariantType('(bsbb)');
        if (!(variant.is_of_type(expectedVariant))) {
            this.logger.error(`Markup instantiated with variant of wrong type ${variant.get_type_string()}`);
            return;
        }
        const unpack = variant.deep_unpack();
        this.bold = unpack[Shared.STYLE_BOLD];
        this.italic = unpack[Shared.STYLE_ITALIC];
        this.changeColor = unpack[Shared.STYLE_CHANGE_COLOR];
        this.color = unpack[Shared.STYLE_COLOR];
    }

    toVariant() {
        const tuple = [];
        tuple[Shared.STYLE_BOLD] = GLib.Variant.new_boolean(this.bold);
        tuple[Shared.STYLE_ITALIC] = GLib.Variant.new_boolean(this.italic);
        tuple[Shared.STYLE_CHANGE_COLOR] = GLib.Variant.new_boolean(this.changeColor);
        tuple[Shared.STYLE_COLOR] = GLib.Variant.new_string(this.color);
        return GLib.Variant.new_tuple(tuple);
    }

    toString() {
        return `[object Markup] (bold: ${this.bold}, italic: ${this.italic}, changeColor: ${
            this.changeColor}, color: ${this.color})`;
    }
}

/* vi: set expandtab tabstop=4 shiftwidth=4: */
