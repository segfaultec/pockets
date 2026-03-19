
type ChatlogMessage = {
    sender: string,
    message: string
}

export default class Chat {

    private messages: ChatlogMessage[] = [];

    constructor() {

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