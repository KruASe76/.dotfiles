export class LogDecorator {
    constructor() {
        this._loggerFunction = log;
    }

    set logger(logger) {
        this._loggerFunction = logger;
    }

    _getLoggedFunction(object, func, name) {
        return (...args) => {
            const verboseArgs = args.map(arg => {
                if (arg === null) {
                    return 'null';
                }
                if (arg === undefined) {
                    return 'undefined';
                }
                return arg;
            });
            const logText = `${name}(${verboseArgs.join(', ')});`;

            this._loggerFunction.apply(this, [logText]);
            return func.apply(object, args);
        };
    }

    addLoggingToNamespace(namespaceObject) {
        for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(namespaceObject))) {
            const potentialFunction = namespaceObject[name];
            if (potentialFunction instanceof Function) {
                namespaceObject[name] = this._getLoggedFunction(namespaceObject, potentialFunction, name);
            }
        }
    }
}

/* vi: set expandtab tabstop=4 shiftwidth=4: */
