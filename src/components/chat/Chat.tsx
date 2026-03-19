import { Component, createRef, JSX, RefObject, TargetedKeyboardEvent, TargetedMouseEvent } from "preact";
import { CS } from "../app";
import { useContext, useMemo } from "preact/hooks";

import * as css from "../pk.module.css";
import { CharsheetApp } from "components/charsheet_app";

type ChatlogEntryProps = {
    header: string,
    message: string
}

class ChatlogEntry extends Component<ChatlogEntryProps> {

    componentDidUpdate(previousProps: Readonly<ChatlogEntryProps>, previousState: Readonly<{}>, snapshot: any): void {
        console.log(`Message ${this.props.message} updated`)
    }

    render() {
        return <div className={css.chat_message_container}>
            <span className={css.chat_header}>{this.props.header}</span>
            <span className={css.chat_message}>{this.props.message}</span>
        </div>
    }
}

class Chatlog extends Component {

    entry_components: JSX.Element[] = []

    render() {

        let { sheet } = useContext(CS);

        const messages = sheet.chat.get_inner().get_messages();

        for (let idx = 0; idx < messages.length; idx++)
        {
            const message = messages[idx];

            // Don't rerender old messages
            const component = useMemo(
                () => <ChatlogEntry header={message.sender} message={message.message} />,
                [message]
            );

            this.entry_components[idx] = component;
        }

        while (messages.length < this.entry_components.length)
        {
            this.entry_components.pop();
        }

        return <div id={css.chat_chatlog}>
            <h1>Chatlog</h1>
            <div>
                {this.entry_components}
            </div>
        </div>
    }
}

class Chatbox extends Component {

    textboxRef: RefObject<HTMLTextAreaElement> = createRef();

    onInputKeydown(sheet: CharsheetApp, event: TargetedKeyboardEvent<HTMLTextAreaElement>) {

        if (event.key == "Enter") {
            event.preventDefault();
            this.sendMessage(sheet);
        }

    }

    onSendClicked(sheet: CharsheetApp) {

        this.sendMessage(sheet);
        
    }

    sendMessage(sheet: CharsheetApp) {

        const textbox = this.textboxRef.current;
        if (textbox && textbox.value) {
            
            sheet.chat.mutate((chat) => {
                chat.add_message("Mix", textbox.value);
            });

            textbox.value = "";
        }
    }

    render() {
        let { sheet } = useContext(CS);

        return <div id={css.chat_chatbox}>
            <textarea
                ref={this.textboxRef}
                onKeyDown={this.onInputKeydown.bind(this, sheet)}
                autoComplete="off"
                />
            <button onClick={this.onSendClicked.bind(this, sheet)}>Send</button>
        </div>;
    }
}

export default class Chat extends Component {
    render() {
        return <div id={css.chat}>
            <Chatlog />
            <Chatbox />
            </div>;
    }
}