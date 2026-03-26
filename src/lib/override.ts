import { UnparsedAttribute, AttrKey } from "./attribute";
import { ContainerBase } from "./ContainerBase";

export class Override {

    override_key: AttrKey;
    new_override_expression: UnparsedAttribute;

    constructor(override_key: AttrKey, new_override_expression: UnparsedAttribute) {
        this.override_key = override_key;
        this.new_override_expression = new_override_expression;
    }
}

export type OverrideKey = string;

export type OverrideContainer = ContainerBase<OverrideKey, Override>;