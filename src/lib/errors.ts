
import { Result } from 'true-myth';
import { AttrKey, OverrideKey } from './attribute';

export class ErrorContext {

    display: string;

    constructor(display: string) {
        this.display = display;
    }
}

export abstract class Error {
    context_stack: ErrorContext[] = [];

    abstract Display(): string;

    PrintContext(): string {
        let out = "";
        this.context_stack.forEach(element => {
            out += element.display + "\n";
        });
        return out;
    }

    PushContext(context: ErrorContext): void {
        this.context_stack.push(context);
    }
}

export class UnknownVariable extends Error {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    Display(): string {
        return `Unknown Variable \"${this.name}\"`
    }
};

export class UnknownOverrideKey extends Error {
    attribute_key: AttrKey;
    override_key: OverrideKey;

    constructor(attribute_key: AttrKey, override_key: OverrideKey) {
        super();
        this.attribute_key = attribute_key;
        this.override_key = override_key;
    }

    Display(): string {
        return `Unknown Override Key "${this.override_key}" for attribute "${this.attribute_key}"`
    }
}

export class FunctionInvalidIndex extends Error {
    index: number;

    constructor(index: number) {
        super();
        this.index = index;
    }

    Display(): string {
        return `Function input at index ${this.index} not found`;
    }
}

export class AttributeCycle extends Error {
    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    Display(): string {
        return `Attribute cycle \"${this.name}\"`
    }
};

export class Timeout extends Error {
    Display(): string {
        return `Timeout (infinite loop?)`
    }
};

export class DivisionByZero extends Error {
    Display(): string {
        return `Division by zero`;
    }
};

export class ParsingError extends Error {
    description: string | null = null;

    constructor(desc: string | null = null) {
        super();
        this.description = desc;
    }

    Display(): string {
        if (this.description !== null) {
            return `Parsing error \"${this.description}\"`;
        } else {
            return "Parsing error";
        }
    }
}

export class UnreachableError extends Error {
    description: string;

    constructor(desc: string) {
        super();
        this.description = desc;
    }

    Display(): string {
        return "Unreachable error, should not happen! " + this.description;
    }
}

export type MyResult<T> = Result<T, Error>;

export function add_context<T>(result: MyResult<T>, context_display: string): MyResult<T> {

    if (result.isErr) {
        result.error.PushContext(new ErrorContext(context_display));
    }
    
    return result;
}