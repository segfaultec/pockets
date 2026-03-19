import { Component } from "preact";

import * as css from "../pk.module.css";

type ChatlogEntryProps = {
    header: string,
    message: string
}

class ChatlogEntry extends Component<ChatlogEntryProps> {
    render() {
        return <div className={css.chat_message_container}>
            <span className={css.chat_header}>{this.props.header}</span>
            <span className={css.chat_message}>{this.props.message}</span>
        </div>
    }
}

class Chatlog extends Component {
    render() {
        return <div id={css.chat_chatlog}>
            <h1>Chatlog</h1>
            <div>
                <ChatlogEntry header="Mix:" message="Hello world!" />
            </div>
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