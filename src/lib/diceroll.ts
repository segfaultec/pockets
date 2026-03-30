import * as comparison from "./diceroll/parser/comparison"

export type Diceroll = {
    result: number,
    ignored: boolean
}

export type DicerollResult = {
    result: number,
    crit_success: boolean,
    crit_fail: boolean,
    ignored: boolean
}

export type DicerollResultSet = {
    total: number,
    rolls: DicerollResult[]
}

export class CritRange {

    value: number;
    op: comparison.ComparisonOperator

    constructor(value: number, op: comparison.ComparisonOperator) {
        this.value = value;
        this.op = op;
    }

    IsInRange(result: number): boolean {
        return this.op.Compare(result, this.value);
    }

    static DefaultCritSuccess(die_size: number): CritRange {
        return new CritRange(die_size, new comparison.GreaterThanOrEqualComparison);
    }

    static DefaultCritFailure(): CritRange {
        return new CritRange(1, new comparison.LessThanOrEqualComparison);
    }
}

type CritRangeUnionType = "critsuccess" | "critfail";

export class CritRangeUnion {
    crit_success_ranges: CritRange[] | null = null;
    crit_fail_ranges: CritRange[] | null = null;

    constructor() {}

    Extend(type: CritRangeUnionType, new_range: CritRange) {
        switch (type) {
            case "critsuccess":
                if (this.crit_success_ranges === null) {
                    this.crit_success_ranges = [new_range]
                } else {
                    this.crit_success_ranges.push(new_range);
                }
                break;
            case "critfail":
                if (this.crit_fail_ranges === null) {
                    this.crit_fail_ranges = [new_range]
                } else {
                    this.crit_fail_ranges.push(new_range);
                }
                break;
        }
    }
    
    SetToNone(type: CritRangeUnionType) {
        switch (type) {
            case "critsuccess":
                this.crit_success_ranges = [];
                break;
            case "critfail":
                this.crit_fail_ranges = [];
                break;
        }
    }

    Reset(type: CritRangeUnionType) {
        switch (type) {
            case "critsuccess":
                this.crit_success_ranges = null;
                break;
            case "critfail":
                this.crit_fail_ranges = null;
                break;
        }
    }

    IsInRange(type: CritRangeUnionType, result: number, die_size: number): boolean {

        let ranges: CritRange[];
        switch (type) {
            case "critsuccess":
                if (this.crit_success_ranges === null) {
                    ranges = [CritRange.DefaultCritSuccess(die_size)]
                } else {
                    ranges = this.crit_success_ranges;
                }
                break;
            case "critfail":
                if (this.crit_fail_ranges === null) {
                    ranges = [CritRange.DefaultCritFailure()]
                } else {
                    ranges = this.crit_fail_ranges;
                }
                break;
        }

        for (const range of ranges) {
            if (range.IsInRange(result)) {
                return true;
            }
        }
        return false;
    }
}

export class DicerollSet {
    results: Diceroll[];
    size: number;
    crit_range: CritRangeUnion;

    constructor(results: Diceroll[], size: number) {
        this.results = results;
        this.size = size;
        this.crit_range = new CritRangeUnion
    }

    evaluate(): DicerollResultSet {
        let total = 0;
        let rolls = [];

        for (const result of this.results) {
            if (!result.ignored) {
                total += result.result;
            }

            const eval_result: DicerollResult = {
                result: result.result,
                ignored: result.ignored,
                crit_success: this.crit_range.IsInRange("critsuccess", result.result, this.size),
                crit_fail: this.crit_range.IsInRange("critfail", result.result, this.size)
            }

            rolls.push(eval_result);
        }

        return {total, rolls};
    }
}