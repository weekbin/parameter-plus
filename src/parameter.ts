interface GlobalOptions {
  required: boolean;
  autoConvert: boolean;
  interrupt: boolean;
  strict: boolean;
}

type PartialGlobalOptions = Partial<GlobalOptions>;

interface CheckRule {
  type: string;
  required?: boolean;
  autoConvert: boolean;
  message?: string;
  min: number;
  max: number;
}

function checkNumber(this: Parameter, rule: any, source: any) {
  console.log(rule, source);

  const required = rule.hasOwnProperty("required")
    ? rule.required
    : this.options.required;
  if (required && (source === "undefined" || source === null)) {
    return { rule, source };
  }

  const autoConvert = rule.hasOwnProperty("autoConvert")
    ? rule.autoConvert
    : this.options.autoConvert;
  if (autoConvert) {
    source = Number(source);
  }

  if (typeof source !== "number") return { rule, source };

  if (rule.hasOwnProperty("max") && source > rule.max) {
    return { rule, source };
  }

  if (rule.hasOwnProperty("min") && source < rule.min) {
    return { rule, source };
  }
}

function checkString() {}

function checkBoolean() {}

function checkObject() {}

function checkArray() {}

function isPrimitive(source: any) {
  return (
    typeof source === "boolean" ||
    typeof source === "string" ||
    typeof source === "number"
  );
}

function isPrimitiveType(type: string) {
  return type === "string" || type === "boolean" || type === "number";
}

class Parameter {
  protected options: GlobalOptions;
  protected CHECK_RULES = {
    number: checkNumber,
    string: checkString,
    boolean: checkBoolean,
    object: checkObject,
    array: checkArray,
  };

  protected CUSTOM_CHECK_RULES: { [key: string]: any } = {};

  protected get ALL_CHECK_RULES() {
    return Object.assign({}, this.CHECK_RULES, this.CUSTOM_CHECK_RULES);
  }

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

  normalizeRule() {}

  validate(rules: any, source: any) {
    const errors = [];

    for (const [sk, sv] of Object.entries(source)) {
      if (sk in rules) {
        const error = this.ALL_CHECK_RULES[rules[sk].type].call(
          this,
          rules[sk],
          sv
        );
        if (error) {
          errors.push(error);
          if (this.options.interrupt) {
            break;
          }
        }
      } else {
        if (this.options.strict) {
          delete source[sk];
        }
      }
    }
    return errors;
  }

  addValidateRule(type: string, validator: any) {
    if (type in this.CHECK_RULES) {
      throw new Error(
        `type ${Object.keys(this.CHECK_RULES).join(", ")} has default checker`
      );
    }

    if (type in this.CUSTOM_CHECK_RULES) {
      throw new Error(`type ${type} has duplicate checker`);
    }

    this.CUSTOM_CHECK_RULES[type] = validator;
  }
}

module.exports = Parameter;
