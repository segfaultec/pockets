import { MyResult } from "lib/errors";

import { ParsedExpression } from "./parser/mod";
import { Diceroll, DicerollResult, DicerollResultSet, DicerollSet } from "lib/diceroll";
import { ContainerBase } from "lib/ContainerBase";

abstract class EvaluatedLiteral {

    abstract ToString(): string;

}

export class EvaluatedAttribute extends EvaluatedLiteral {
    name: string;
    annex: EvaluatedExpressionToken[];
    total: number;

    constructor(total: number, name: string, annex: EvaluatedExpressionToken[]) {
        super();
        this.name = name;
        this.annex = annex;
        this.total = total;
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


export class EvaluatedDiceroll extends EvaluatedLiteral {
    result: DicerollResult;

    constructor(result: DicerollResult) {
        super();
        this.result = result;
    }

    ToString(): string {
        if (this.result.ignored) {
            return `:${this.result.result}:`
        } else if (this.result.crit_success) {
            return `[${this.result.result} CS]`;
        } else if (this.result.crit_fail) {
            return `[${this.result.result} CF]`;
        } else {
            return `[${this.result.result}]`;
        }
    }
}

export type EvaluatedExpressionToken = string | EvaluatedLiteral;

export class EvaluatedExpression {

    total: number = 0;
    annex: EvaluatedExpressionToken[];

    private constructor(total: number, annex: EvaluatedExpressionToken[]) {
        this.total = total;
        this.annex = annex;
    }

    static FixedLiteral(value: number) {
        return new EvaluatedExpression(value, [new EvaluatedFixed(value)]);
    }

    static RollLiteral(rolls: DicerollSet) {

        const eval_result = rolls.evaluate();
        return new EvaluatedExpression(eval_result.total, eval_result.rolls.map((result) => {
            
            return new EvaluatedDiceroll(result);
        }))
    }

    static AttributeLiteral(value: number, attribute_name: string, attribute_inner: EvaluatedExpressionToken[]) {
        return new EvaluatedExpression(value, [new EvaluatedAttribute(value, attribute_name, attribute_inner)]);
    }

    static Infix(new_total: number, lhs: EvaluatedExpression, sep: string, rhs: EvaluatedExpression) {
        let new_annex = lhs.annex;
        new_annex.push(sep);
        new_annex = new_annex.concat(rhs.annex);
        return new EvaluatedExpression(new_total, new_annex);
    }

    static Prefix(new_total: number, sep: string, rhs: EvaluatedExpression) {
        let new_annex: EvaluatedExpressionToken[] = [sep];
        new_annex = new_annex.concat(rhs.annex);
        return new EvaluatedExpression(new_total, new_annex);
    }

    private static print_annex_inner(annex: EvaluatedExpressionToken[]): string {
        let outstr = "";
        for (const token of annex) {
            if (typeof token === "string") {
                outstr += token;
            }
            else if (token instanceof EvaluatedAttribute) {
                outstr += this.print_annex_inner(token.annex);
            }
            else {
                outstr += token.ToString();
            }
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