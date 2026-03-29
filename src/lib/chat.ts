import { Result } from "true-myth";
import { err, ok } from "true-myth/dist/es/result";
import { EvaluatedExpression, Parse, ParsedExpression } from "./diceroll/mod";
import { add_context, Error, MyResult } from "./errors";
import { TextField } from "./textfield";
import { AttrContainer } from "./attribute";

export type ChatlogMessage_Base = {
    sender: string
}

export type ChatlogMessage_Message = ChatlogMessage_Base & {
    type: "message"
    message: string
}

export type ChatlogMessage_EvalSuccess = ChatlogMessage_Base & {
    type: "evalsuccess"
    action: string,
    expr: EvaluatedExpression
}

export type ChatlogMessage_EvalFailure = ChatlogMessage_Base & {
    type: "evalfailure",
    action: string,
    error: Error
}

export type ChatlogMessage_GenericError = ChatlogMessage_Base & {
    type: "genericerror",
    error_message: string
}

export type ChatlogMessage_PrintField = ChatlogMessage_Base & {
    type: "printfield",
    header: string,
    contents: string
}

export type TextFieldPart_EvalSuccess = {
    type: "evalsuccess",
    expr: EvaluatedExpression
}

export type TextFieldPart_EvalFailure = {
    type: "evalfailure",
    error: Error
}

export type TextFieldPart_String = {
    type: "string",
    contents: string
}

export type TextFieldPart = TextFieldPart_String | TextFieldPart_EvalFailure | TextFieldPart_EvalSuccess;

export type ChatlogMessage_TextField = ChatlogMessage_Base & {
    type: "textfield",
    title: string,
    contents: TextFieldPart[]
}

export type ChatlogMessage = 
    ChatlogMessage_Message 
    | ChatlogMessage_EvalFailure 
    | ChatlogMessage_EvalSuccess
    | ChatlogMessage_GenericError
    | ChatlogMessage_PrintField
    | ChatlogMessage_TextField;

type ChatlogCommandType = "Roll";

export type ChatlogCommand = {
    commandType: ChatlogCommandType,
    args: string
}

export function ChatlogFromEvalResult(sender: string, action: string,eval_result: MyResult<EvaluatedExpression>) {
    let new_message: ChatlogMessage;
    if (eval_result.isOk) {
        new_message = {
            sender, action,
            type: "evalsuccess",
            expr: eval_result.value
        }
    } else {
        new_message = {
            sender, action,
            type: "evalfailure",
            error: eval_result.error
        }
    }
    return new_message;
}

function ToChatlogCommandType(str: string | undefined): ChatlogCommandType | undefined {
    if (str === "roll" || str === "r") {
        return "Roll";
    }

    return undefined;
}

type ProcessCommandCallbackFunc = (sender: string, command: ChatlogCommand) => ChatlogMessage;
export default class Chat {

    // Message objects are referenced in memos, so reassign a new object instead of mutating an existing one!
    private messages: ChatlogMessage[] = [];

    private processCommandCallback?: ProcessCommandCallbackFunc;

    constructor(processCommandCallback?: ProcessCommandCallbackFunc) {
        this.processCommandCallback = processCommandCallback;
    }

    add_message_with_commands(sender: string, message: string) {

        if (message.startsWith("/") && this.processCommandCallback)
        {
            const command = this.parse_command(message);
            if (command.isOk) {
                const response = this.processCommandCallback(sender, command.value);
                this.messages.push(response);
            } else {
                this.messages.push({
                    type: "genericerror",
                    error_message: command.error,
                    sender
                })
            }
        } else {
            this.add_message(sender, message);
        }
    }

    parse_command(message: string): Result<ChatlogCommand, string> {

        message = message.trim();
        message = message.substring(1);

        const split_index = message.indexOf(" ");

        let command: string;
        let args: string;
        if (split_index >= 0)
        {
            command = message.substring(0, split_index).toLowerCase();
            args = message.substring(split_index + 1);
        } else {
            command = message;
            args = ""
        }

        const commandType = ToChatlogCommandType(command);

        if (commandType) {
            let args = message.substring(split_index + 1);
            return ok({ commandType, args });
        } else {
            return err(`Unknown command: "${command}"`);
        }
    }

    run_text_field(attributes: Readonly<AttrContainer>, sender: string, text_field: TextField) {

        let out_parts: TextFieldPart[] = [];

        for (const in_part of text_field.contents) {
            if (in_part.is_expr) {
                const evaluate = (parsed: ParsedExpression) => (
                    attributes.evaluate_expression(parsed)
                );
                const parsed = Parse(in_part.value);
                const evaluated = parsed.andThen(evaluate);
                if (evaluated.isOk) {
                    out_parts.push({
                        type: "evalsuccess",
                        expr: evaluated.value
                    })
                } else {
                    out_parts.push({
                        type: "evalfailure",
                        error: evaluated.error
                    })
                }
            } else {
                out_parts.push({
                    type: "string",
                    contents: in_part.value
                })
            }
        }

        this.messages.push({
            type: "textfield",
            sender,
            title: text_field.title,
            contents: out_parts
        })
    }

    add_message(sender: string, message: string) {
        this.messages.push({
            type: "message",
            sender, message
        });
    }
    add_message_eval_result(sender: string, action: string, eval_result: MyResult<EvaluatedExpression>) {
        this.messages.push(ChatlogFromEvalResult(sender, action, eval_result));
    }
    add_message_print_field(sender: string, header: string, contents: string) {
        this.messages.push({
            type: "printfield",
            sender, header, contents
        });
    }
    clear_messages() {
        this.messages = []
    }

    get_messages() {
        return this.messages;
    }
}