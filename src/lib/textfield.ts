import { ContainerBase } from "./ContainerBase";

export type TextFieldToken = {
    value: string,
    is_expr: boolean;
}

export class TextField {
    title: string;
    contents: TextFieldToken[];

    private constructor(title: string, contents: TextFieldToken[]) {
        this.title = title;
        this.contents = contents;
    }

    static Parse(title: string, raw_text_field: string): TextField {

        let tokens: TextFieldToken[] = [];

        let current_token = "";
        let expr_stack = 0;

        const flush = (is_expr: boolean) => {
            if (current_token.length > 0)
            {
                tokens.push({value: current_token, is_expr});
            }
            current_token = ""
        }

        for (const char of raw_text_field) {
            if (char === "[") {
                if (expr_stack == 0) {
                    flush(false);
                } else {
                    current_token += char;
                }

                expr_stack++;
            }
            else if (char === "]") {
                if (expr_stack == 1) {
                    flush(true);
                } else {
                    current_token += char;
                }

                if (expr_stack > 0) {
                    expr_stack--;
                }
            } else {
                current_token += char;
            }
        }

        flush(false);

        return new TextField(title, tokens);
    }
}

type TextFieldCategoryKey = string;
export type TextFieldContainer = ContainerBase<TextFieldCategoryKey, TextField[]>;