import { AttrContainer } from "lib/attribute";
import { Charsheet, CharsheetSkillsBox } from "lib/charsheet";
import { EvaluatedExpression, Parse, Evaluate, UnparsedExpression, ParsedExpression } from "lib/diceroll/mod";
import { add_context, MyResult } from "lib/errors";
import SignalWrapper from "./utils/SignalWrapper";
import { Signal } from "@preact/signals";
import { TextFieldContainer } from "lib/TextFieldContainer";
import { Maybe } from "true-myth";
import { nothing } from "true-myth/dist/es/maybe";
import Chat, { ChatlogCommand, ChatlogFromEvalResult, ChatlogMessage } from "lib/chat";
import { err } from "true-myth/dist/es/result";

export class CharsheetApp {
    
    attributes: SignalWrapper<AttrContainer>;
    text_fields: SignalWrapper<TextFieldContainer>;

    edit_mode: Signal<boolean>;
    advanced_display: Signal<boolean>;
    last_ran_expr: SignalWrapper<Maybe<MyResult<EvaluatedExpression>>>;

    public skills: CharsheetSkillsBox;

    chat: SignalWrapper<Chat>;

    constructor(sheet: Charsheet) {
        this.attributes = new SignalWrapper(sheet.attributes);
        this.text_fields = new SignalWrapper(sheet.text_fields);
        this.edit_mode = new Signal(false);
        this.advanced_display = new Signal(false);
        this.last_ran_expr = new SignalWrapper(nothing());
        this.skills = sheet.skills;

        let chat = new Chat(this.run_command.bind(this));
        chat.add_message_with_commands("debug", "/roll 2d20kh1+[str_mod]");

        this.chat = new SignalWrapper(chat);
    }

    to_charsheet(): Charsheet {
        return new Charsheet(this.attributes.unpack(), this.text_fields.unpack(), this.skills);
    }

    run_command(sender: string, command: ChatlogCommand): ChatlogMessage {

        switch (command.commandType) {
            case "Roll":
                const result = this.run_command_roll(command.args);

                return ChatlogFromEvalResult(sender, `Rolling ${command.args}`, result);
        }

        return {
            sender,
            type: "genericerror",
            error_message: "Unknown command"
        };
    }

    run_command_roll(expr: UnparsedExpression): MyResult<EvaluatedExpression> {
        
        const evaluate = (parsed: ParsedExpression) => (
            this.attributes.get_inner().get_parsed().evaluate_expression(parsed)
        );

        const parsed = add_context(Parse(expr), "Parsing command");
        const evaluated = add_context(parsed.andThen(evaluate), "Evaluating command");

        return evaluated;
    }
}