import { Component, createRef, JSX, RefObject } from "preact"
import { useMemo } from "preact/hooks"

import ChatlogEntry from "./ChatlogEntry";

import * as css from "../pk.module.css";
import { ChatlogMessage } from "lib/chat";

type ChatlogProps = {
    messages: ChatlogMessage[]
}

export default class Chatlog extends Component<ChatlogProps> {

    scrollboxRef: RefObject<HTMLElement> = createRef();
    entry_components: JSX.Element[] = []

    scrollToBottom() {
        console.log("scrollToBottom")
        if (this.scrollboxRef.current)
        {
            this.scrollboxRef.current.scroll({
                "behavior": "instant",
                "top": this.scrollboxRef.current.scrollHeight
            })
        }
    }

    componentDidMount(): void {
        this.scrollToBottom();
    }

    componentDidUpdate(previousProps: Readonly<ChatlogProps>, previousState: Readonly<{}>, snapshot: any): void {
        // Only scroll to the bottom if we have new messages
        if (previousProps.messages.length < this.props.messages.length) {
            this.scrollToBottom();
        }
    }

    render() {

        const messages = this.props.messages;

        for (let idx = 0; idx < messages.length; idx++)
        {
            const message = messages[idx];

            // Don't rerender old messages
            const component = useMemo(
                () => <ChatlogEntry message={message}/>,
                [message]
            );

            this.entry_components[idx] = component;
        }

        while (messages.length < this.entry_components.length)
        {
            this.entry_components.pop();
        }

        return <div ref={this.scrollboxRef as RefObject<HTMLDivElement>} id={css.chat_chatlog}>
            {this.entry_components}
        </div>
    }
}
