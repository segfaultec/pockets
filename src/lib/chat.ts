import { Result } from "true-myth";
import { err, ok } from "true-myth/dist/es/result";
import { EvaluatedExpression } from "./diceroll/mod";
import { Error, MyResult } from "./errors";

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

export type ChatlogMessage = 
    ChatlogMessage_Message 
    | ChatlogMessage_EvalFailure 
    | ChatlogMessage_EvalSuccess
    | ChatlogMessage_GenericError
    | ChatlogMessage_PrintField;

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