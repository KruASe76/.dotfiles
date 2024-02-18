import { SpinType } from './spinType.js'
import { ColorType } from './colorType.js'
import { PriorityMarkupType } from './priorityMarkupType.js'
import { BooleanType } from './booleanType.js'
import { IntegerType } from './integerType.js'
import { StringType } from './stringType.js'
import { PathType } from './pathType.js'
import { HelpType } from './helpType.js'
import { ShortcutType } from './shortcutType.js'
import * as Utils from '../../libs/utils.js'

export function getType(data) {
    if (Utils.isChildValid(data, 'widget')) {
        if (data['widget'] === 'spin') {
            return new SpinType();
        }
        if (data['widget'] === 'color') {
            return new ColorType();
        }
        if (data['widget'] === 'priorityMarkup') {
            return new PriorityMarkupType();
        }
    }
    if (data['type'] === 'boolean') {
        return new BooleanType();
    }
    if (data['type'] === 'integer') {
        return new IntegerType();
    }
    if (data['type'] === 'string') {
        return new StringType();
    }
    if (data['type'] === 'path') {
        return new PathType();
    }
    if (data['type'] === 'help') {
        return new HelpType();
    }
    if (data['type'] === 'shortcut') {
        return new ShortcutType();
    }
    return null;
}
