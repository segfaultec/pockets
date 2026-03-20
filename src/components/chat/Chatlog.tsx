import { Component, createRef, JSX, RefObject } from "preact"
import { useMemo } from "preact/hooks"

import * as css from "../pk.module.css";
import { ChatlogMessage } from "lib/chat";
import { MakeChatlogEntry } from "./ChatlogEntry";

type ChatlogProps = {
    messages: ChatlogMessage[]
}

export default class Chatlog extends Component<ChatlogProps> {

    scrollboxRef: RefObject<HTMLElement> = createRef();
    entry_components: JSX.Element[] = []
    renderedMessageCount = 0;

    scrollToBottom() {
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
        if (this.renderedMessageCount < this.props.messages.length) {
            this.scrollToBottom();
        }

        this.renderedMessageCount = this.props.messages.length;
    }

    render() {

        const messages = this.props.messages;

        for (let idx = 0; idx < messages.length; idx++)
        {
            const message = messages[idx];

            // Don't rerender old messages
            const component = useMemo(
                () => MakeChatlogEntry(message),
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
