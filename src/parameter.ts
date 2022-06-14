interface GlobalOptions {
    required: boolean;
    autoConvert: boolean;
    interrupt: boolean;
    strict: boolean;
}

type PartialGlobalOptions = Partial<GlobalOptions>;

function checkNumber() {}

function checkString() {}

function checkBoolean() {}

function checkObject() {}

function checkArray() {}

class Parameter {
    protected options: GlobalOptions;
    protected CHECK_RULES = {
        number: checkNumber.bind(this),
        string: checkString.bind(this),
        boolean: checkBoolean.bind(this),
        object: checkObject.bind(this),
        array: checkArray.bind(this),
    };

    protected CUSTOM_CHECK_RULES: { [key: string]: any } = {};

    constructor(options?: PartialGlobalOptions | undefined | null) {
        this.options = this.normalizeOptions(options);
    }

    normalizeOptions(options: PartialGlobalOptions | undefined | null) {
        const normalizedOptions: GlobalOptions = {
            required: false,
            autoConvert: false,
            interrupt: false,
            strict: false,
        };

        if (options) {
            normalizedOptions.required = !!options.required;
            normalizedOptions.autoConvert = !!options.autoConvert;
            normalizedOptions.interrupt = !!options.interrupt;
            normalizedOptions.strict = !!options.strict;
        }

        return normalizedOptions;
    }

    validate(rules: any, source: any) {
        console.log(rules, source);

        if (this.options.strict) {
            this.cleanDirtyValues(rules, source);
        }
    }

    cleanDirtyValues(rules: any, source: any) {
        for (let key of Object.keys(source)) {
            if (key in rules) {
                continue;
            } else {
                delete source[key];
            }
        }
    }

    addValidateRule(type: string, validator: any) {
        if (type in this.CHECK_RULES) {
            throw new Error(
                `type ${Object.keys(this.CHECK_RULES).join(
                    ", "
                )} has default checker`
            );
        }

        if (type in this.CUSTOM_CHECK_RULES) {
            throw new Error(`type ${type} has duplicate checker`);
        }

        this.CUSTOM_CHECK_RULES[type] = validator.bind(this);
    }
}

module.exports = Parameter
