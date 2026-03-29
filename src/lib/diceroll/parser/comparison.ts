
export abstract class ComparisonOperator {
    abstract Compare(lhs: number, rhs: number): boolean;
}

export class LessThanComparison extends ComparisonOperator {
    Compare(lhs: number, rhs: number): boolean {
        return lhs < rhs;
    }
}

export class LessThanOrEqualComparison extends ComparisonOperator {
    Compare(lhs: number, rhs: number): boolean {
        return lhs <= rhs;
    }
}

export class GreaterThanComparison extends ComparisonOperator {
    Compare(lhs: number, rhs: number): boolean {
        return lhs > rhs;
    }
}

export class GreaterThanOrEqualComparison extends ComparisonOperator {
    Compare(lhs: number, rhs: number): boolean {
        return lhs >= rhs;
    }
}

export class EqualComparison extends ComparisonOperator {
    Compare(lhs: number, rhs: number): boolean {
        return lhs == rhs;
    }
}