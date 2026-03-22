import { MyResult } from "lib/errors";

import { ParsedExpression } from "./parser/mod";
import { Diceroll, DicerollResult, DicerollResultSet, DicerollSet } from "lib/diceroll";
import { ContainerBase } from "lib/ContainerBase";
import { CollapsePrefixInfo } from "./parser/operation";

abstract class EvaluatedLiteral {

    abstract ToString(): string;

}

export class EvaluatedAttribute extends EvaluatedLiteral {
    name: string;
    annex: EvaluatedExpressionToken;
    total: number;
    advanced: Boolean;

    constructor(total: number, name: string, annex: EvaluatedExpressionToken, advanced: Boolean) {
        super();
        this.name = name;
        this.annex = annex;
        this.total = total;
        this.advanced = advanced;
    }

    ToString(): string {
        return `${this.total} [${this.name}]`;
    }
}

export class EvaluatedFixed extends EvaluatedLiteral {
    value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    ToString(): string {
        return this.value.toString();
    }
}

export class EvaluatedPrefix extends EvaluatedLiteral {
    rhs: EvaluatedExpressionToken;
    seperator: string;
    total: number;
    rhs_total: number;

    collapse_instructions: CollapsePrefixInfo | null;

    constructor(total: number, rhs_total: number, seperator: string, rhs: EvaluatedExpressionToken, collapse_instructions: CollapsePrefixInfo | null) {
        super();

        this.rhs = rhs;
        this.seperator = seperator;
        this.total = total;
        this.rhs_total = rhs_total;
        this.collapse_instructions = collapse_instructions;
    }

    ToString(): string {
        return `${this.seperator}${this.rhs.toString()}`;
    }
}

export class EvaluatedInfix extends EvaluatedLiteral {
    lhs: EvaluatedExpressionToken;
    rhs: EvaluatedExpressionToken;
    seperator: string;
    total: number;
    lhs_total: number;
    rhs_total: number;

    collapse_instructions: CollapsePrefixInfo | null;

    constructor(total: number, lhs_total: number, rhs_total: number, lhs: EvaluatedExpressionToken, sep: string, rhs: EvaluatedExpressionToken, collapse_instructions: CollapsePrefixInfo | null)
    {
        super();

        this.total = total;
        this.lhs = lhs;
        this.rhs = rhs;
        this.seperator = sep;
        this.lhs_total = lhs_total;
        this.rhs_total = rhs_total;

        this.collapse_instructions = collapse_instructions;
    }

    ToString(): string {
        let outstr = "";
        if (this.lhs) {
            outstr += this.lhs.toString();
        }
        outstr += this.seperator;
        outstr += this.rhs.toString();
        return outstr;
    }
}

export class EvaluatedDiceroll extends EvaluatedLiteral {
    results: DicerollResult[];

    constructor(results: DicerollResult[]) {
        super();
        this.results = results;
    }

    ToString(): string {
        let outstr = "";
        for (const result of this.results)
        {
            if (result.ignored) {
                outstr += `:${result.result}:`
            } else if (result.crit_success) {
                outstr += `[${result.result} CS]`;
            } else if (result.crit_fail) {
                outstr += `[${result.result} CF]`;
            } else {
                outstr += `[${result.result}]`;
            }
        }
        return outstr;
    }
}

export type EvaluatedExpressionToken = (string | EvaluatedLiteral);

export class EvaluatedExpression {

    total: number = 0;
    annex: EvaluatedExpressionToken;

    private constructor(total: number, annex: EvaluatedExpressionToken) {
        this.total = total;
        this.annex = annex;
    }

    static FixedLiteral(value: number) {
        return new EvaluatedExpression(value, new EvaluatedFixed(value));
    }

    static RollLiteral(rolls: DicerollSet) {

        const eval_result = rolls.evaluate();

        let results = eval_result.rolls;

        return new EvaluatedExpression(eval_result.total, new EvaluatedDiceroll(results));
    }

    static AttributeLiteral(value: number, attribute_name: string, attribute_inner: EvaluatedExpressionToken, advanced: Boolean) {
        return new EvaluatedExpression(value, new EvaluatedAttribute(value, attribute_name, attribute_inner, advanced));
    }

    static Infix(new_total: number, lhs: EvaluatedExpression, sep: string, rhs: EvaluatedExpression, collapse_instructions: CollapsePrefixInfo | null) {

        let annex = new EvaluatedInfix(new_total, lhs.total, rhs.total, lhs.annex, sep, rhs.annex, collapse_instructions);

        return new EvaluatedExpression(new_total, annex);
    }

    static Prefix(new_total: number, sep: string, rhs: EvaluatedExpression, collapse_instructions: CollapsePrefixInfo | null) {

        let annex = new EvaluatedPrefix(new_total, rhs.total, sep, rhs.annex, collapse_instructions);
        
        return new EvaluatedExpression(new_total, annex);
    }

    private static print_annex_inner(annex: EvaluatedExpressionToken): string {
        let outstr = "";
        const token = annex;
        if (typeof token === "string") {
            outstr += token;
        }
        else if (token instanceof EvaluatedAttribute) {
            outstr += this.print_annex_inner(token.annex);
        }
        else {
            outstr += token.ToString();
        }

        return outstr;
    }

    print_annex(): string {
        return EvaluatedExpression.print_annex_inner(this.annex);
    }
}

export type EvaluationContext = {
    attributes: ContainerBase<string, MyResult<ParsedExpression>>;
    functioninputstack: EvaluatedExpression[][];
};

export { Parse, UnparsedExpression, ParsedExpression } from "./parser/mod";

export function Evaluate(expr: ParsedExpression, attributes: ContainerBase<string, MyResult<ParsedExpression>>): MyResult<EvaluatedExpression> {
    const context: EvaluationContext = { attributes, functioninputstack: [] };

    return expr.parsed_expression.evaluate(context);
}

export function EvaluateFunction(funcexpr: ParsedExpression, inputexpr: EvaluatedExpression, attributes: ContainerBase<string, MyResult<ParsedExpression>>): MyResult<EvaluatedExpression> {

    const context: EvaluationContext = { attributes, functioninputstack: [[inputexpr]] };

    return funcexpr.parsed_expression.evaluate(context);
}