import { CharsheetApp } from "components/charsheet_app";
import { Component, createRef, RefObject, TargetedKeyboardEvent } from "preact";
import { useContext } from "preact/hooks";

import { CS } from "../App";
import * as css from "./chat.module.css";

export default class Chatbox extends Component {

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
                chat.add_message_with_commands("Mix", textbox.value);
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
