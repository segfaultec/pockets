import { AttrContainer, UnparsedAttrContainer } from "lib/attribute";
import { Charsheet, CharsheetSkillsBox } from "lib/charsheet";
import { EvaluatedExpression } from "lib/diceroll/mod";
import { MyResult } from "lib/errors";
import SignalWrapper from "./utils/SignalWrapper";
import { Signal } from "@preact/signals";
import { TextFieldContainer } from "lib/TextFieldContainer";
import { Maybe } from "true-myth";
import { nothing } from "true-myth/dist/es/maybe";
import Chat from "lib/chat";

export class CharsheetApp {
    
    attributes: SignalWrapper<AttrContainer>;
    text_fields: SignalWrapper<TextFieldContainer>;

    edit_mode: Signal<boolean>;
    last_ran_expr: SignalWrapper<Maybe<MyResult<EvaluatedExpression>>>;

    public skills: CharsheetSkillsBox;

    chat: SignalWrapper<Chat>;

    constructor(sheet: Charsheet) {
        this.attributes = new SignalWrapper(sheet.attributes);
        this.text_fields = new SignalWrapper(sheet.text_fields);
        this.edit_mode = new Signal(false);
        this.last_ran_expr = new SignalWrapper(nothing());
        this.skills = sheet.skills;
        this.chat = new SignalWrapper(new Chat());
    }

    to_charsheet(): Charsheet {
        return new Charsheet(this.attributes.unpack(), this.text_fields.unpack(), this.skills);
    }
}