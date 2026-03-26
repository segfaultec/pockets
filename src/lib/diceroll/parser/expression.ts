import { InfixOperation, PrefixOperation, RollOperation } from './operation';

import { ok, err } from 'true-myth/dist/es/result';

import { MyResult } from "lib/errors";
import * as Error from "lib/errors";
import { EvaluatedExpression, EvaluationContext } from '../mod'; 
import { RollMod } from './rollmods';

export type ParseContext = {
    unresolved_variables: Set<string>;
}

export abstract class Expr {

    abstract evaluate(context: EvaluationContext): MyResult<EvaluatedExpression>;
}

abstract class Literal extends Expr {
}
;
export class NumberLiteral extends Literal {
    value: number;
    constructor(value: number) {
        super();
        this.value = value;
    }

    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {
        return ok(EvaluatedExpression.FixedLiteral(this.value));
    }
}

// Todo is this needed? Could just be Expr if we don't need attribute_name
export abstract class AttributeInnerExpr extends Expr {

    attribute_name: string;

    constructor(attribute_name: string) {
        super();

        this.attribute_name = attribute_name;
    }
}

export class AttributeLiteral extends Literal {
    inner: AttributeInnerExpr
    advanced: boolean

    constructor(inner: AttributeInnerExpr, advanced: boolean) {
        super();

        this.inner = inner;
        this.advanced = advanced;
    }

    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {

        return this.inner.evaluate(context).map((result) => (
            // todo pass advanced here
            EvaluatedExpression.AttributeLiteral(result.total, this.inner.attribute_name, result.annex, this.advanced)
        ));
    }
}

export class FunctionInnerExpr extends AttributeInnerExpr {
    key: string;
    params: Expr[];

    constructor(key: string, params: Expr[]) {
        super(key);

        this.key = key;
        this.params = params;
    }

    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {
        const attr = context.attributes.get(this.key);
        if (attr === undefined)
        {
            return err(new Error.UnknownVariable(this.key));
        }

        if (attr.isErr)
        {
            return err(attr.error);
        }

        let functioninputs = [];
        for (var param of this.params) {
            const result = param.evaluate(context);
            if (result.isErr) {
                return result;
            }
            functioninputs.push(result.value);
        }

        if (functioninputs.length > 0)
        {
            context.functioninputstack.push(functioninputs);
        }

        const result = attr.value.parsed_expression.evaluate(context);
        
        if (functioninputs.length > 0)
        {
            context.functioninputstack.pop();
        }

        return result;
    }
}

export class FunctionInputInnerExpr extends AttributeInnerExpr {
    index: number;
    constructor(index: number) {
        super(`input${index}`);
        this.index = index;
    }

    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {
        
        const inputstack = context.functioninputstack;

        if (inputstack.length == 0) {
            return err(new Error.FunctionInvalidIndex(this.index));
        }

        const inputs = inputstack[context.functioninputstack.length - 1];
        if (inputs.length - 1 < this.index) {
            return err(new Error.FunctionInvalidIndex(this.index))
        }

        return ok(inputs[this.index]);
    }
}

export class InfixExpression extends Expr {
    left: Expr;
    op: InfixOperation;
    right: Expr;
    constructor(left: Expr, op: InfixOperation, right: Expr) {
        super();

        this.left = left;
        this.op = op;
        this.right = right;
    }

    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {
        const leftEval = this.left.evaluate(context);
        if (leftEval.isErr) { return leftEval; }
        const rightEval = this.right.evaluate(context);
        if (rightEval.isErr) { return rightEval; }

        const collapse_instructions = this.op.CollapseInfix ? this.op.CollapseInfix(leftEval.value.total, rightEval.value.total) : null;

        const result = this.op.RunInfix(leftEval.value.total, rightEval.value.total);
        return result.map((total) => {
            return EvaluatedExpression.Infix(total, leftEval.value, this.op.GetInfixStr(), rightEval.value, collapse_instructions);
        });
    }
}
export class PrefixExpression extends Expr {
    op: PrefixOperation;
    right: Expr;
    constructor(op: PrefixOperation, right: Expr) {
        super();
        this.op = op;
        this.right = right;
    }

    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {
        const rightEval = this.right.evaluate(context);
        if (rightEval.isErr) { return rightEval; }

        const result = this.op.RunPrefix(rightEval.value.total);
        return result.map((total) => {
            return EvaluatedExpression.Prefix(total, this.op.GetPrefixStr(), rightEval.value);
        });
    }
}
// Rolls are not like regular prefixes/infixes:
// they are displayed as just a literal rather than a combo of lhs and rhs
export class RollExpression extends Expr {
    left: Expr;
    right: Expr;
    mods: RollMod[];

    constructor(left: Expr | null, right: Expr, mods: RollMod[]) {
        super();
        
        if (left !== null) {
            this.left = left;
        } else {
            this.left = new NumberLiteral(1);
        }

        this.right = right;
        this.mods = mods;
    }
    
    evaluate(context: EvaluationContext): MyResult<EvaluatedExpression> {
        const leftEval = this.left.evaluate(context);
        if (leftEval.isErr) { return leftEval; }
        const rightEval = this.right.evaluate(context);
        if (rightEval.isErr) { return rightEval; }

        const result = RollOperation(leftEval.value.total, rightEval.value.total);
        return result.map((diceroll) => {
            for (const mod of this.mods) {
                mod.ApplyRollMod(diceroll);
            }
            return EvaluatedExpression.RollLiteral(diceroll);
        });
    }
}