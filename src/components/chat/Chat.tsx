import { Component } from "preact";

import * as css from "../pk.module.css";

class Chatlog extends Component {
    render() {
        return <div id={css.chat_chatlog}>
            <p>Chatlog</p>
        </div>
    }
}

class Chatbox extends Component {
    render() {
        return <div id={css.chat_chatbox}>
            <textarea
                autoComplete="off"
                />
            <button>Send</button>
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