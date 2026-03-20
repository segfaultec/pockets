
import { Component } from "preact";
import { EvaluatedExpression, EvaluatedExpressionToken, EvaluatedAttribute } from "lib/diceroll/mod";

import * as css from "./eval.module.css"

type EvalSuccessProps = {
    eval_result: EvaluatedExpression
};

type EvalSuccessAnnexProps = {
    annex: EvaluatedExpressionToken[]
}

class EvalSuccessAnnex extends Component<EvalSuccessAnnexProps> {
    render() {
        return this.props.annex.map((token) => {
            if (typeof token === "string") {
                return <span>{token}</span>;
            }
            else if (token instanceof EvaluatedAttribute) {
                return <EvalSuccessAnnex annex={token.annex} />;
            }
            else {
                return <span>{token.ToString()}</span>;
            }
        })
    }
}

export class EvalSuccess extends Component<EvalSuccessProps> {

    render() {
        return <div>
            <span>{this.props.eval_result.total} = </span><EvalSuccessAnnex annex={this.props.eval_result.annex} />
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
                    <EvalSuccessTreeAnnex annex={token.annex} />
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
            <EvalSuccessTreeAnnex annex={this.props.eval_result.annex} />
            </details>;
    }
}