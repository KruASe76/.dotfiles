import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import * as Errors from './errors.js';
import * as Utils from './utils.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');

const LINE_NOT_FOUND = -1;

export class JsTextFile {
    constructor(path, logger, translatorFunction) {
        this.logger = Utils.getDefaultIfInvalid(logger, Utils.getDefaultLogger());
        if (!Utils.isValid(path)) {
            throw new Errors.IoError('JsTextFile: no path specified', this.logger.error);
        }
        this.logger.debug(`Creating JsTextFile for path ${path}`);
        this.path = path;
        this._lines = [];
        this.translatorFunction = translatorFunction;
    }

    static async createEmpty(path) {
        await Gio.file_new_for_path(path).replace_contents_bytes_async(new GLib.Bytes(new Uint8Array()), null, false,
            Gio.FileCreateFlags.NONE, null);
    }

    static async load(path, logger, translatorFunction, cancellable = null) {
        const textFile = new JsTextFile(path, logger, translatorFunction);
        await textFile._loadLines(cancellable);
        return textFile;
    }

    // Returns true if file exists, false if not
    exists() {
        if (GLib.file_test(this.path, GLib.FileTest.EXISTS)) {
            return true;
        }
        this.logger.error(`JsTextFile: File does not exist : ${this.path}`);
        return false;
    }

    // Loads all lines from the text file
    async _loadLines(cancellable) {
        const file = Gio.file_new_for_path(this.path);
        let contents = null;
        try {
            [contents] = await file.load_contents_async(cancellable);
        } catch (exception) {
            if (exception instanceof GLib.Error && exception.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND)) {
                throw new Errors.IoError(`JsTextFile: trying to load non-existing file ${this.path}`,
                    this.logger.error);
            }
            throw exception;
        }
        let content = Utils.arrayToString(contents);
        const LAST_CHARACTER = -1;
        const FIRST_CHARACTER = 0;
        if (content.slice(LAST_CHARACTER) === '\n') {
            content = content.slice(FIRST_CHARACTER, LAST_CHARACTER);
        }
        this._lines = content.split('\n');
    }

    // Returns the number in the lines-array that contains the matching string
    // Returns LINE_NOT_FOUND if text is not found
    _getLineNum(text) {
        if (!this.exists()) {
            return LINE_NOT_FOUND;
        }
        return this._lines.indexOf(text);
    }

    // Saves the lines to a file
    async saveFile(removeEmptyLines) {
        if (!this.exists()) {
            return false;
        }
        if (removeEmptyLines === true) {
            this._removeEmptyLines();
        }
        try {
            const lines = this._lines.join('\n');
            // make sure file ends with a newline
            const bytes = new GLib.Bytes(new TextEncoder().encode(`${lines}\n`));
            await Gio.file_new_for_path(this.path).replace_contents_bytes_async(bytes, null, false,
                Gio.FileCreateFlags.NONE, null);
        } catch (exception) {
            throw new Errors.FileWriteError(exception.toString(), this.path, this.logger.error, this.translatorFunction);
        }
        return true;
    }

    _removeEmptyLines() {
        this._lines = this._lines.filter((value) => {
            return (value !== '');
        });
    }

    get lines() {
        if (!this.exists()) {
            this.logger.error('JsTextFile: no path specified');
        }
        return this._lines;
    }

    removeLine(text) {
        const lineNum = this._getLineNum(text);
        if (lineNum === LINE_NOT_FOUND) {
            return false;
        }
        const NUMBER_OF_LINES_TO_REMOVE = 1;
        this._lines.splice(lineNum, NUMBER_OF_LINES_TO_REMOVE);
        return true;
    }

    addLine(text, atFront) {
        if (!this.exists()) {
            return false;
        }
        if (atFront === true) {
            this._lines.unshift(text);
            return true;
        }
        this._lines.push(text);
        return true;
    }

    modifyLine(oldtext, newtext) {
        if (!this.exists()) {
            return false;
        }
        const index = this._getLineNum(oldtext);
        if (index !== LINE_NOT_FOUND) {
            this._lines[index] = newtext;
            return true;
        }
        return false;
    }

    set lines(newlines) {
        this._lines = newlines;
    }
}

/* vi: set expandtab tabstop=4 shiftwidth=4: */
