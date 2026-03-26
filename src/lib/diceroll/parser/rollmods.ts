import { DicerollSet } from "lib/diceroll";
import { MyResult } from "lib/errors";
import { ok } from "true-myth/dist/es/result";

export abstract class RollMod {
    // Todo - DicerollSet roll mod apply history, to be printed out in advanced view
    abstract ApplyRollMod(diceroll: DicerollSet): MyResult<null>;
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