import Gio from 'gi://Gio';

import { Logger } from '../third_party/logger/logger.js';
import * as Shared from './sharedConstants.js';

export function getDefaultLogger() {
    const logger = new Logger();
    logger.prefix = '[todo.txt]';
    logger.addLevel('error', '[ERROR  ]', Shared.LOG_ERROR);
    logger.addLevel('warning', '[WARNING]', Shared.LOG_WARNING);
    logger.addLevel('info', '[INFO   ]', Shared.LOG_INFO);
    logger.addLevel('detail', '[DETAIL ]', Shared.LOG_DETAIL);
    logger.addLevel('debug', '[DEBUG  ]', Shared.LOG_DEBUG);
    logger.addLevel('flow', '[FLOW   ]', Shared.LOG_FLOW);
    logger.addNewLine = false;
    return logger;
}

export function isValid(object) {
    if (typeof object === 'undefined') {
        return false;
    }
    if (object === null) {
        return false;
    }
    return true;
}

export function isChildValid(object, child) {
    if (!isValid(object)) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(object, child) && isValid(object[child]);
}

/* exported getDefaultIfInvalid */
export function getDefaultIfInvalid(object, defaultValue) {
    if (!isValid(object)) {
        return defaultValue;
    }
    return object;
}

export function getIconFromNames(names) {
    if (!isValid(names)) {
        return null;
    }
    if (!(names instanceof Array)) {
        names = [ names ];
    }
    return Gio.ThemedIcon.new_from_names(names);
}

function getDottedChild(object, string) {
    return string.split('.').reduce((accumulator, value) => {
        if (Object.prototype.hasOwnProperty.call(accumulator, value) && isValid(accumulator, value)) {
            return accumulator[value];
        }
        return null;
    }, object);
}

export function getFirstValidChild(object, candidateChildren) {
    for (let i = 0, len = candidateChildren.length; i < len; i++) {
        if (isValid(getDottedChild(object, candidateChildren[i]))) {
            return getDottedChild(object, candidateChildren[i]);
        }
    }
    return null;
}

export function arrayToString(array) {
    if (array instanceof Uint8Array) {
        return new TextDecoder().decode(array);
    }
    return array.toString();
}
