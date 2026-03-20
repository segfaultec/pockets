import { Component } from "preact";
import { useContext } from "preact/hooks";

import Chatbox from "./Chatbox";
import Chatlog from "./Chatlog";

import { CS } from "../app";
import * as css from "../pk.module.css";


export default class Chat extends Component {
    render() {

        let { sheet } = useContext(CS);

        let messages = sheet.chat.get_inner().get_messages();

        return <div id={css.chat}>
            <span class={css.chat_header}>Chatlog</span>
            <Chatlog messages={messages}/>
            <Chatbox />
            </div>;
    }
}