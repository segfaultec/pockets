
import { Error } from "lib/errors";
import { Component } from "preact";

import * as css from "./eval.module.css"

type EvalErrorProps = {
    eval_error: Error
};

export class EvalError extends Component<EvalErrorProps> {
    render() {
        return <div>
            Error: {this.props.eval_error.Display()}<br/>

            <ul>
            {this.props.eval_error.context_stack.map(
                (ctx) => { return <li>{ctx.display}</li>; }
            )}
            </ul>
        </div>
    }
}