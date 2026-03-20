import { Component, JSX } from "preact";
import { ChatlogMessage, ChatlogMessage_Base, ChatlogMessage_EvalFailure, ChatlogMessage_EvalSuccess, ChatlogMessage_GenericError, ChatlogMessage_Message, ChatlogMessage_PrintField } from "lib/chat";

import * as css from "../pk.module.css";
import { EvalSuccess } from "components/eval/EvalSuccess";
import { EvalError } from "components/eval/EvalError";
import { ClsCombine } from "components/utils/ClassHelpers";

abstract class ChatlogEntryBase<T extends ChatlogMessage_Base> extends Component<{message: T}> {}

export function MakeChatlogEntry(message: ChatlogMessage): JSX.Element {
    switch (message.type) {
        case "evalsuccess":
            return <ChatlogEntry_EvalSuccess message={message} />;
        case "evalfailure":
            return <ChatlogEntry_EvalFailure message={message} />;
        case "message":
            return <ChatlogEntry_Message message={message} />;
        case "genericerror":
            return <ChatlogEntry_GenericError message={message} />;
        case "printfield":
            return <ChatlogEntry_PrintField message={message} />;
    }
}

class BasicChatlogEntry extends Component<{header: string, message: string, className?: string}> {
    render() {
        return <div className={ClsCombine(css.chat_message_container, this.props.className)}>
            <span className={css.chat_header}>{this.props.header}</span>
            <span className={css.chat_message}>{this.props.message}</span>
        </div>
    }
}

class ChatlogEntry_EvalSuccess extends ChatlogEntryBase<ChatlogMessage_EvalSuccess> {
    render() {

        const header1 = this.props.message.sender + ":";
        const header2 = this.props.message.action;

        return <div className={css.chat_message_container}>
            <span className={css.chat_header}>{header1}</span>
            <span className={css.chat_header}>{header2}</span>
            <EvalSuccess eval_result={this.props.message.expr} />
        </div>
    }
}

class ChatlogEntry_EvalFailure extends ChatlogEntryBase<ChatlogMessage_EvalFailure> {
    render() {
        // todo error context
        return <div className={ClsCombine(css.chat_message_container, css.chat_error)}>
            <span className={css.chat_header}>{this.props.message.action}: Error!</span>
            <EvalError eval_error={this.props.message.error} />
        </div>
    }
}

class ChatlogEntry_Message extends ChatlogEntryBase<ChatlogMessage_Message> {

    render() {
        const header = this.props.message.sender + ":";
        const message = this.props.message.message;

        return <div className={css.chat_message_container}>
            <span className={css.chat_header}>{header}</span>
            <span className={css.chat_message}>{message}</span>
        </div>
    }
}

class ChatlogEntry_PrintField extends ChatlogEntryBase<ChatlogMessage_PrintField> {
    render() {
        const header1 = this.props.message.sender + ":";
        const header2 = this.props.message.header;
        const message = this.props.message.contents;

        return <div className={css.chat_message_container}>
            <span className={css.chat_header}>{header1}</span>
            <span className={css.chat_header}>{header2}</span>
            <span className={css.chat_message}>{message}</span>
        </div>
    }
}

class ChatlogEntry_GenericError extends ChatlogEntryBase<ChatlogMessage_GenericError> {
    render() {
        return <BasicChatlogEntry
            header="Error!"
            message={this.props.message.error_message}
            className={css.chat_error} />
    }
}