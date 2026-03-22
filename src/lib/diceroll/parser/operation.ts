import { ok, err } from "true-myth/dist/es/result"
import { MyResult, DivisionByZero } from "lib/errors"
import { DicerollSet, Diceroll } from "lib/diceroll";

export type CollapsePrefixInfo = {
    new_rhs: number,
    new_str: string
};

export interface InfixOperation {
    RunInfix(left: number, right: number): MyResult<number>;
    GetInfixStr(): string;

    CollapseInfix?(lhs: number, rhs: number): CollapsePrefixInfo | null;
}
export interface PrefixOperation {
    RunPrefix(right: number): MyResult<number>;
    GetPrefixStr(): string;

    CollapsePrefix?(rhs: number): CollapsePrefixInfo | null;
}


export class AddOperation implements PrefixOperation, InfixOperation {
    RunInfix(left: number, right: number): MyResult<number> {
        return ok(left + right);
    }

    GetInfixStr(): string {
        return " + "
    }

    CollapseInfix(lhs: number, rhs: number): CollapsePrefixInfo | null {
        if (rhs < 0.0) {
            return {
                new_rhs: -rhs,
                new_str: " - "
            }
        } else {
            return {
                new_rhs: rhs,
                new_str: this.GetInfixStr()
            }
        }
    }

    CollapsePrefix(rhs: number): CollapsePrefixInfo | null {
        if (rhs < 0.0) {
            return {
                new_rhs: -rhs,
                new_str: "-"
            }
        } else {
            return {
                new_rhs: rhs,
                new_str: this.GetPrefixStr()
            }
        }
    }

    RunPrefix(right: number): MyResult<number> {
        return this.RunInfix(0, right);
    }

    GetPrefixStr(): string {
        return "+"
    }
}
export class SubtractOperation implements PrefixOperation, InfixOperation {
    RunInfix(left: number, right: number): MyResult<number> {
        return ok(left - right);
    }

    GetInfixStr(): string {
        return " - "
    }

    RunPrefix(right: number): MyResult<number> {
        return this.RunInfix(0, right);
    }

    GetPrefixStr(): string {
        return "-"
    }

    CollapseInfix(lhs: number, rhs: number): CollapsePrefixInfo | null {
        return {
            new_rhs: rhs,
            new_str: this.GetInfixStr()
        }
    }

    CollapsePrefix(rhs: number): CollapsePrefixInfo | null {
        return {
            new_rhs: rhs,
            new_str: this.GetPrefixStr()
        }
    }
}
export class FloorDivideOperation implements InfixOperation {
    RunInfix(left: number, right: number): MyResult<number> {
        if (right === 0.0) {
            return err(new DivisionByZero);
        }

        return ok(Math.floor(left / right));
    }
    GetInfixStr(): string {
        return " // "
    }
}
export class DivideOperation implements InfixOperation {
    RunInfix(left: number, right: number): MyResult<number> {
        if (right == 0.0) {
            return err(new DivisionByZero);
        }

        return ok(left / right);
    }
    GetInfixStr(): string {
        return " / "
    }
}
export class MultiplyOperation implements InfixOperation {
    RunInfix(left: number, right: number): MyResult<number> {
        return ok(left * right);
    }
    GetInfixStr(): string {
        return " * "
    }
}
export class PowerOfOperation implements InfixOperation {
    RunInfix(left: number, right: number): MyResult<number> {
        return ok(left ** right);
    }
    GetInfixStr(): string {
        return " ^ "
    }
}

export function RollOperation(left: number, right: number): MyResult<DicerollSet> {
    if (left == 0 || right == 0) {
        return ok(new DicerollSet([], right));
    }

    var results: Diceroll[] = [];
    var total = 0;
    for (var i = 0; i < left; i++) {
        const result = Math.floor(Math.random() * right) + 1;
        total += result;
        results.push({
            result,
            ignored: false
        });
    }

    return ok(new DicerollSet(results, right));
}