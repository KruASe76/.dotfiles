export const TodoTxtErrorTypes = {
    TODO_TXT_ERROR: 0,
    FILE_WRITE_PERMISSION_ERROR: 1,
    FILE_WRITE_ERROR: 2
};

const TodoTxtError = class extends Error {
    constructor(error, logFunction) {
        super(error);
        this.type = TodoTxtErrorTypes.TODO_TXT_ERROR;

        if (error === undefined) {
            error = '';
        }
        if (typeof logFunction === 'function') {
            logFunction(error);
        }
        this.message = error;
    }
};

export class FileWriteError extends TodoTxtError {
    constructor(error, filename, logFunction, _) {
        super(_("An error occurred while writing to %(file): %(error)").replace('%(file)', filename).replace(
            '%(error)', error), logFunction);
        this.type = TodoTxtErrorTypes.FILE_WRITE_ERROR;
    }
}

export class ConfigurationError extends TodoTxtError {
    constructor(error, logFunction) {
        super(error, logFunction);
        this.name = 'ConfigurationError';
    }
}

export class UndefinedTokenError extends TodoTxtError {
    constructor(error, logFunction) {
        super(error, logFunction);
        this.name = 'UndefinedTokenError';
    }
}

export class IoError extends TodoTxtError {
    constructor(error, logFunction) {
        super(error, logFunction);
        this.name = 'IoError';
    }
}

export class JsonError extends TodoTxtError {
    constructor(error, logFunction) {
        super(error, logFunction);
        this.name = 'JsonError';
    }
}

export class SettingsTypeError extends TodoTxtError {
    constructor(setting, expectedType, value) {
        super(`Expected value of type ${expectedType}, but got ${typeof value
        } while setting ${setting}.`);
        this.name = 'SettingsTypeError';
    }
}

/* vi: set expandtab tabstop=4 shiftwidth=4: */
