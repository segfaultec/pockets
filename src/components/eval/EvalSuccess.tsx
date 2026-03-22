
import { Component } from "preact";
import { EvaluatedExpression, EvaluatedExpressionToken, EvaluatedAttribute, EvaluatedDiceroll, EvaluatedFixed } from "lib/diceroll/mod";

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
    annex: EvaluatedExpressionToken[],
    advanced_display: Boolean
}

class EvalSuccessAnnex extends Component<EvalSuccessAnnexProps> {
    render() {
        return this.props.annex.map((token) => {
            if (typeof token === "string") {
                return <span className={css.annex_string}>{token}</span>;
            }
            else if (token instanceof EvaluatedAttribute) {

                if (this.props.advanced_display || !token.advanced) {
                    return <span>
                        <EvalSuccessAnnex annex={token.annex} advanced_display={this.props.advanced_display} />
                        </span>;
                } else {
                    return <span className={css.annex_literal_fixed}>{token.total}</span>;
                }
            }
            else if (token instanceof EvaluatedDiceroll) {
                return <EvalDiceroll results={token.results} />;
            }
            else if (token instanceof EvaluatedFixed) {
                return <span className={css.annex_literal_fixed}>{token.ToString()}</span>;
            }
        })
    }
}

type EvalSuccessProps = {
    eval_result: EvaluatedExpression,
    advanced_display: Boolean
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
        return this.props.annex.map((token) => {
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
        });
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