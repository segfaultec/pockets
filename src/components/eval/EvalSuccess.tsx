
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

type EvalSuccessAnnexProps = {
    annex: EvaluatedExpressionToken,
    advanced_display: boolean
}

class EvalSuccessAnnex extends Component<EvalSuccessAnnexProps> {

    // Todo this is messy, should be on EvaluatedExpressionToken instead
    collapse_token(token: EvaluatedExpressionToken): number | false {
        if (token instanceof EvaluatedFixed) {
            return token.total;
        } else if (token instanceof EvaluatedAttribute) {
            return this.collapse_token(token.annex);
        } else if (token instanceof EvaluatedPrefix) {
            return token.total;
        } else if (token instanceof EvaluatedInfix) {
            const lhs = this.collapse_token(token.lhs);
            const rhs = this.collapse_token(token.rhs);

            if (lhs !== false && rhs !== false) {
                return token.total;
            }
        }
        return false;
    }

    render() {
        const token = this.props.annex;

        if (!this.props.advanced_display && this.collapse_token(token)) {
            return <span className={css.annex_literal_fixed}>{token.total}</span>;
        }

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

            const try_collapse_rhs = this.collapse_token(token.rhs);
            if (!this.props.advanced_display && try_collapse_rhs !== false && token.collapse_instructions) {

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
            return <span>
                <span className={css.annex_string}>{token.seperator}</span>
                <EvalSuccessAnnex annex={token.rhs} advanced_display={this.props.advanced_display} />
            </span>
        }
        else if (token instanceof EvaluatedDiceroll) {
            return <EvalDiceroll results={token.results} />;
        }
        else if (token instanceof EvaluatedFixed) {
            return <span className={css.annex_literal_fixed}>{token.total}</span>;
        }
    }
}

type EvalSuccessProps = {
    eval_result: EvaluatedExpression,
    advanced_display: boolean,
    short_display?: boolean
};

export class EvalSuccess extends Component<EvalSuccessProps> {

    render() {
        if (this.props.short_display) {
            return <div className={css.eval_container}>{this.props.eval_result.total}</div>
        } else {
            return <div className={css.eval_container}>
                <span className={css.total}>{this.props.eval_result.total}</span> = <EvalSuccessAnnex annex={this.props.eval_result.annex} advanced_display={this.props.advanced_display} />
            </div>
        }

    }
}