import { CritRange, CritRangeUnion, DicerollSet } from "lib/diceroll";
import { MyResult } from "lib/errors";
import { ok } from "true-myth/dist/es/result";
import { ComparisonOperator } from "./comparison";

export abstract class RollMod {
    // Todo - DicerollSet roll mod apply history, to be printed out in advanced view
    abstract ApplyRollMod(diceroll: DicerollSet): MyResult<null>;
}

export class CritBoundsRollMod extends RollMod {
    bound: "critsuccess" | "critfail";
    range: CritRange | "clear"

    constructor(bound: "critsuccess" | "critfail", range: CritRange | "clear") {
        super()
        this.bound = bound;
        this.range = range;
    }

    static MakeUnion(bound: "critsuccess" | "critfail", op: ComparisonOperator, value: number): CritBoundsRollMod {
        return new CritBoundsRollMod(bound, new CritRange(value, op));
    }

    static MakeClear(bound: "critsuccess" | "critfail"): CritBoundsRollMod {
        return new CritBoundsRollMod(bound, "clear");
    }

    ApplyRollMod(diceroll: DicerollSet): MyResult<null> {
        let union: CritRangeUnion;
        switch (this.bound) {
            case "critsuccess":
                union = diceroll.crit_success_range;
                break;
            case "critfail":
                union = diceroll.crit_fail_range;
                break;
        }

        if (this.range === "clear") {
            union.Clear();
        } else {
            union.Extend(this.range);
        }

        return ok(null);
    }
}

export class FilterRollMod extends RollMod {
    mode: "keep" | "drop";
    test: "higher" | "lower";
    amount: number;

    constructor(mode: "keep" | "drop", test: "higher" | "lower", amount: number) {
        super();
        this.mode = mode;
        this.test = test;
        this.amount = amount;
    }

    ApplyRollMod(diceroll: DicerollSet): MyResult<null> {

        const rolls = diceroll.results;

        if (rolls.length == 0) {
            return ok(null);
        }

        let sort_mult = 1;
        if (this.test == "higher") {
            sort_mult *= -1;
        }
        if (this.mode == "drop") {
            sort_mult *= -1;
        }

        let sorted_indexes = rolls
            .map((v,i) => i)
            .filter(i => !rolls[i].ignored)
            .sort((a, b) => sort_mult * (rolls[b].result - rolls[a].result));

        const ignore_count = this.mode == "drop" ? this.amount : rolls.length-this.amount;
        for (let idx = 0; idx < ignore_count; idx++) {
            if (idx >= sorted_indexes.length) {
                continue;
            }

            rolls[sorted_indexes[idx]].ignored = true;
        }

        return ok(null);
    }
}