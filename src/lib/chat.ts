import { Maybe } from "true-myth";
import { just, nothing } from "true-myth/dist/es/maybe";

export type ChatlogMessage = {
    sender: string,
    message: string
}

type ChatlogCommandType = "Roll";

export type ChatlogCommand = {
    commandType: ChatlogCommandType,
    args: string
}

function ToChatlogCommandType(str: string | undefined): ChatlogCommandType | undefined {
    if (str === "roll" || str === "r") {
        return "Roll";
    }

    return undefined;
}

export default class Chat {

    // Message objects are referenced in memos, so reassign a new object instead of mutating an existing one!
    private messages: ChatlogMessage[] = [];

    private processCommandCallback?: (command: ChatlogCommand) => string;

    constructor(processCommandCallback?: (command: ChatlogCommand) => string) {
        this.processCommandCallback = processCommandCallback;
    }

    add_message_with_commands(sender: string, message: string): Object {

        const command = this.parse_command(message);
        if (command.isJust && this.processCommandCallback) {
            const response = this.processCommandCallback(command.value);
            return this.add_message(sender, response);
        }

        return this.add_message(sender, message);
    }

    parse_command(message: string): Maybe<ChatlogCommand> {

        message = message.trim();

        if (!message.startsWith("/")) {
            return nothing();
        }

        message = message.substring(1);

        const split_index = message.indexOf(" ");

        let commandType = ToChatlogCommandType(message.substring(0, split_index).toLowerCase());

        if (commandType) {
            let args = message.substring(split_index + 1);
            return just({ commandType, args });
        }

        return nothing();
    }

    add_message(sender: string, message: string): Object {

        const new_message: ChatlogMessage = {
            sender,
            message
        };

        this.messages.push(new_message);

        return new_message;
    }

    clear_messages() {
        this.messages = []
    }

    get_messages() {
        return this.messages;
    }
}