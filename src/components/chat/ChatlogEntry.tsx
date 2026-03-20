import { Component } from "preact";
import { ChatlogMessage } from "lib/chat";

import * as css from "../pk.module.css";

type ChatlogEntryProps = {
    message: ChatlogMessage
}

export default class ChatlogEntry extends Component<ChatlogEntryProps> {

    componentDidMount(): void {
        console.log(`Message ${this.props.message.message} mounted`)
    }

    componentDidUpdate(previousProps: Readonly<ChatlogEntryProps>, previousState: Readonly<{}>, snapshot: any): void {
        console.log(`Message ${this.props.message.message} updated`)
    }

    render() {
        const header = this.props.message.sender + ":";
        const message = this.props.message.message;

        return <div className={css.chat_message_container}>
            <span className={css.chat_header}>{header}</span>
            <span className={css.chat_message}>{message}</span>
        </div>
    }
}