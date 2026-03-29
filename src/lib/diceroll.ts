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

    is_in_range(result: number): boolean {
        return this.op.Compare(result, this.value);
    }
}

export class CritRangeUnion {
    ranges: CritRange[] = []

    static DefaultCritSuccess(die_size: number): CritRangeUnion {
        let union = new CritRangeUnion;
        let range = new CritRange(die_size, new comparison.GreaterThanOrEqualComparison);
        union.Extend(range);
        return union;
    }

    static DefaultCritFailure(): CritRangeUnion {
        let union = new CritRangeUnion;
        let range = new CritRange(1, new comparison.LessThanOrEqualComparison);
        union.Extend(range);
        return union;
    }

    Extend(new_range: CritRange) {
        this.ranges.push(new_range);
    }
    
    Clear() {
        this.ranges = []
    }

    IsInRange(result: number): boolean {
        for (const range of this.ranges) {
            if (range.is_in_range(result)) {
                return true;
            }
        }
        return false;
    }
}

export class DicerollSet {
    results: Diceroll[];
    size: number;
    crit_success_range: CritRangeUnion;
    crit_fail_range: CritRangeUnion;

    constructor(results: Diceroll[], size: number) {
        this.results = results;
        this.size = size;
        this.crit_success_range = CritRangeUnion.DefaultCritSuccess(size);
        this.crit_fail_range = CritRangeUnion.DefaultCritFailure();
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
                crit_success: this.crit_success_range.IsInRange(result.result),
                crit_fail: this.crit_fail_range.IsInRange(result.result)
            }

            rolls.push(eval_result);
        }

        return {total, rolls};
    }
}