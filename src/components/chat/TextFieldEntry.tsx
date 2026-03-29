import { TextFieldPart, TextFieldPart_EvalFailure, TextFieldPart_EvalSuccess, TextFieldPart_String } from "lib/chat";
import { Component, JSX } from "preact";
import * as css from "./chat.module.css";
import { EvalSuccess } from "components/Eval/EvalSuccess";
import { EvalError } from "components/Eval/EvalError";
import { useContext } from "preact/hooks";
import { CS } from "components/App";

export function MakeTextFieldEntry(entry: TextFieldPart): JSX.Element {
    switch (entry.type) {
        case "string":
            return <TextField_String entry={entry} />;
        case "evalsuccess":
            return <TextField_EvalSuccess entry={entry} />;
        case "evalfailure":
            return <TextField_EvalFailure entry={entry} />;
    }
}

abstract class TextFieldEntryBase<T extends TextFieldPart> extends Component<{entry: T}> {}

class TextField_String extends TextFieldEntryBase<TextFieldPart_String> {
    render() {
        return <span>{this.props.entry.contents}</span>;
    }
}

class TextField_EvalSuccess extends TextFieldEntryBase<TextFieldPart_EvalSuccess> {
    render() {
        let { sheet } = useContext(CS);
        return <EvalSuccess short_display eval_result={this.props.entry.expr} advanced_display={sheet.advanced_display.value}/>
    }
}

class TextField_EvalFailure extends TextFieldEntryBase<TextFieldPart_EvalFailure> {
    render() {
        return <EvalError short_display eval_error={this.props.entry.error} />
    }
}