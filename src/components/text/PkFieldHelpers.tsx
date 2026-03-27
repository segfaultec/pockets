import { CharsheetApp } from "components/charsheet_app";
import * as Error from "lib/errors";
import { MyResult } from "lib/errors";
import { Maybe } from "true-myth/dist/es/maybe"
import { fromMaybe } from "true-myth/dist/es/toolbelt";

export function set_text_field_value(sheet: CharsheetApp, key: string, new_value: string) {
    sheet.text_fields.mutate((inner) => {
        inner.modify(key, new_value);
    }, false);
}

export function get_text_field_value(sheet: CharsheetApp, key: string): MyResult<string> {
    const get = sheet.text_fields.get_inner().get(key);
    return fromMaybe(new Error.UnknownVariable(key), Maybe.of(get));
}

export function get_attr_value(sheet: CharsheetApp, key: string): MyResult<string> {
    return sheet.attributes.get_inner()
        .get_unparsed(false).get_attribute(key).map((t) => t.expr);
}

export function set_attr_value(sheet: CharsheetApp, key: string, new_value: string): void {
    sheet.attributes.mutate((inner) => {
        inner.get_unparsed(true).modify_attribute(key, new_value);
    });
}

export function is_edit_mode_enabled(sheet: CharsheetApp): boolean {
    return sheet.edit_mode.value;
}

export function zip_classes(...classes: (string | undefined | null)[]): string {
    let out = "";
    for (const cls of classes) {
        if (typeof cls === "string") {
            out += " " + cls;
        }
    }
    return out;
}