import { err, ok } from "true-myth/dist/es/result";
import { ContainerBase } from "./ContainerBase";
import { MyResult } from "./errors";
import * as Error from "./errors";

type LabelKey = string;
export type Label = string;

export class LabelContainer extends ContainerBase<LabelKey, Label> {

    get_text_field_string(key: LabelKey): MyResult<string> {
        return this.get_text_field(key);
    }

    private get_text_field(key: LabelKey): MyResult<LabelKey> {
        const attr = this.data.get(key);
        if (attr === undefined) {
            return err(new Error.UnknownVariable(key));
        }
        return ok(attr);
    }
}