import { TextFieldSemantics } from "ohm/diceroll.ohm-bundle";
import { ParsedExpression, UnparsedExpression } from "./diceroll/mod";
import grammer, { DicerollSemantics } from "ohm/diceroll.ohm-bundle";
import { MyResult } from "./errors";
import { err, ok } from "true-myth/dist/es/result";
import * as Error from "lib/errors";

type TextFieldToken = {
    value: string,
    is_expr: boolean;
}

const textfield_semantics: TextFieldSemantics = grammer.TextField.createSemantics();

textfield_semantics.addOperation<TextFieldToken>('tokens(context)', {
    FieldEntry_Expr(arg0, arg1, arg2) {
        return {value: arg0.sourceString, is_expr: true};
    },
    FieldEntry_String(arg0) {
        return {value: arg0.sourceString, is_expr: false};
    }
})

textfield_semantics.addOperation<TextFieldToken[]>('tree(context)', {
    Field(arg0) {
        return arg0.asIteration().children.map(
            c => c.tokens(this.args.context)
        )
    }
})

export class TextFieldEntry {
    title: string;
    contents: TextFieldToken[];

    private constructor(title: string, contents: TextFieldToken[]) {
        this.title = title;
        this.contents = contents;
    }

    static Parse(title: string, raw_text_field: string): MyResult<TextFieldEntry> {
        let matchResult;
        try {
            matchResult = grammer.TextField.match(raw_text_field);
        } catch (e) {
            return err(new Error.ParsingError((e as Error).message));
        }

        if (matchResult.failed()) {
            return err(new Error.ParsingError(matchResult.shortMessage));
        }

        let tokens: TextFieldToken[];
        try {
            tokens = textfield_semantics(matchResult).tree();
        } catch (e) {
            return err(new Error.ParsingError((e as Error).message));
        }

        return ok(new TextFieldEntry(title, tokens));
    }
}