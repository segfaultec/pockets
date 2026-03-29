
import { Error } from "lib/errors";
import { Component } from "preact";

import * as css from "./eval.module.css"

type EvalErrorProps = {
    eval_error: Error,
    short_display?: boolean
};

export class EvalError extends Component<EvalErrorProps> {
    render() {
        if (this.props.short_display) {
            return <div className={css.eval_error_short}>Err!</div>
        } else {
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
}