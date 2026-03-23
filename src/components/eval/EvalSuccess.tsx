
import { Component } from "preact";
// todo group and make make * import
import { EvaluatedExpression, EvaluatedExpressionToken, EvaluatedAttribute, EvaluatedDiceroll, EvaluatedFixed, EvaluatedInfix, EvaluatedPrefix } from "lib/diceroll/mod";

import * as css from "./eval.module.css"
import { DicerollResult } from "lib/diceroll";
import { ClsCombine } from "components/utils/ClassHelpers";

type EvalSuccessDicerollProps = {
    results: DicerollResult[]
}

class EvalDiceroll extends Component<EvalSuccessDicerollProps> {
    render() {
        return <span className={css.diceroll_container}>
            {
                this.props.results.map((result) => {
                    let classes = css.diceroll
                    if (result.ignored) {
                        classes += " " + css.ignored
                    }
                    if (result.crit_success) {
                        classes += " " + css.crit_success
                    }
                    if (result.crit_fail) {
                        classes += " " + css.crit_failure
                    }

                    return <span class={classes}>{result.result}</span>;
                })
            }
        </span>
    }
}

type EvalSuccessAnnexCollapsedProps = {
    seperator: string,
    rhs_value: number
}

class EvalSuccessAnnexCollapsed extends Component<EvalSuccessAnnexCollapsedProps> {
    render() {
        return <span>
            <span className={css.annex_string}>{this.props.seperator}</span>
            <span className={css.annex_literal_fixed}>{this.props.rhs_value}</span>
        </span>
    }
}

type EvalSuccessAnnexProps = {
    annex: EvaluatedExpressionToken,
    advanced_display: Boolean
}

class EvalSuccessAnnex extends Component<EvalSuccessAnnexProps> {

    // Todo this is messy, should be on EvaluatedExpressionToken instead
    is_collapsable(token: EvaluatedExpressionToken): boolean {
        if (token instanceof EvaluatedFixed) {
            return true;
        } else if (token instanceof EvaluatedAttribute) {
            return this.is_collapsable(token.annex);
        } else if (token instanceof EvaluatedPrefix) {
            return this.is_collapsable(token.rhs);
        } else if (token instanceof EvaluatedInfix) {
            return this.is_collapsable(token.lhs) && this.is_collapsable(token.rhs);
        }
        return false;
    }

    render() {
        const token = this.props.annex;
        if (token instanceof EvaluatedAttribute) {

            if (this.props.advanced_display || !token.advanced) {
                return <span>
                    <EvalSuccessAnnex annex={token.annex} advanced_display={this.props.advanced_display} />
                    </span>;
            } else {
                return <span className={css.annex_literal_fixed}>{token.total}</span>;
            }
        }
        else if (token instanceof EvaluatedInfix) {

            if (!this.props.advanced_display && token.collapse_instructions !== null && this.is_collapsable(token.rhs))
            {
                return <span>
                    <EvalSuccessAnnex annex={token.lhs} advanced_display={this.props.advanced_display} />
                    <span className={css.annex_string}>{token.collapse_instructions.new_str}</span>
                    <span className={css.annex_literal_fixed}>{token.collapse_instructions.new_rhs}</span>
                </span>
            }

            return <span>
                <EvalSuccessAnnex annex={token.lhs} advanced_display={this.props.advanced_display} />
                <span className={css.annex_string}>{token.seperator}</span>
                <EvalSuccessAnnex annex={token.rhs} advanced_display={this.props.advanced_display} />
            </span>
        }
        else if (token instanceof EvaluatedPrefix) {

            if (!this.props.advanced_display && token.collapse_instructions !== null && this.is_collapsable(token.rhs))
            {
                return <span>
                    <span className={css.annex_string}>{token.collapse_instructions.new_str}</span>
                    <span className={css.annex_literal_fixed}>{token.collapse_instructions.new_rhs}</span>
                </span>
            }

            return <span>
                <span className={css.annex_string}>{token.seperator}</span>
                <EvalSuccessAnnex annex={token.rhs} advanced_display={this.props.advanced_display} />
            </span>
        }
        else if (token instanceof EvaluatedDiceroll) {
            return <EvalDiceroll results={token.results} />;
        }
        else if (token instanceof EvaluatedFixed) {
            return <span className={css.annex_literal_fixed}>{token.ToString()}</span>;
        }
    }
}

type EvalSuccessProps = {
    eval_result: EvaluatedExpression,
    advanced_display: boolean
};

export class EvalSuccess extends Component<EvalSuccessProps> {

    render() {
        return <div className={css.eval_container}>
            <span>{this.props.eval_result.total} = </span><EvalSuccessAnnex annex={this.props.eval_result.annex} advanced_display={this.props.advanced_display} />
        </div>
    }
}

class EvalSuccessTreeAnnex extends Component<EvalSuccessAnnexProps> {
    render() {
        const token = this.props.annex;
        if (typeof token === "string") {
            return <p>{token}</p>;
        }
        else if (token instanceof EvaluatedAttribute) {
            return <details>
                <summary>{token.name}</summary>
                <EvalSuccessTreeAnnex annex={token.annex} advanced_display={this.props.advanced_display} />
            </details>
        }
        else {
            return <p>{token.ToString()}</p>
        }
    }
}

export class EvalSuccessTree extends Component<EvalSuccessProps> {
    render() {
        return <details>
            <summary>Eval Success</summary>
            <EvalSuccessTreeAnnex annex={this.props.eval_result.annex} advanced_display={this.props.advanced_display}/>
            </details>;
    }
}