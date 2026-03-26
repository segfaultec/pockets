import { Parse, Evaluate, UnparsedExpression, ParsedExpression, EvaluatedExpression, EvaluateFunction } from "lib/diceroll/mod";

import { MyResult, add_context } from "./errors";
import * as Error from './errors';
import { ok, err } from "true-myth/dist/es/result";
import { ContainerBase } from "./ContainerBase";

export type AttrKey = string;
export type UnparsedAttribute = UnparsedExpression;

export type UnparsedOverride = {
    expr: UnparsedExpression,
    override_key: AttrKey
}

type ParsedAttribute =  MyResult<ParsedExpression>;

type ParsedOverride = {
    expr_result: MyResult<ParsedExpression>,
    override_key: AttrKey
}


class LinkedAttributesDependencies extends ContainerBase<AttrKey, ParsedAttribute> {}
class LinkedOverrideDependencies extends ContainerBase<AttrKey, ParsedOverride> {}

export class ParsedAttributeContainer {

    private attributes: LinkedAttributesDependencies
    private overrides: LinkedOverrideDependencies

    private enabled_overrides: Set<AttrKey>;

    constructor(attributes: LinkedAttributesDependencies, overrides: LinkedOverrideDependencies, enabled_overrides: Set<AttrKey>) {
        this.attributes = attributes;
        this.overrides = overrides;
        this.enabled_overrides = enabled_overrides;
    }

    calculate_attribute_container(): LinkedAttributesDependencies {
        let clone = this.attributes.clone();
        this.overrides.forEach((override, key) => {
            clone.add(key, override.expr_result);
            if (this.enabled_overrides.has(key)) {
                clone.modify(override.override_key, override.expr_result);
            }
        })
        return clone;
    }

    public evaluate_expression(expr: ParsedExpression): MyResult<EvaluatedExpression> {
        return Evaluate(expr, this.calculate_attribute_container());
    }

    public evaluate_attribute(attrkey: AttrKey, funckey?: AttrKey): MyResult<EvaluatedExpression> {
        const attributes = this.calculate_attribute_container();

        let attr = attributes.get(attrkey);
        if (attr == undefined)
        {
            return err(new Error.UnknownVariable(attrkey));
        }
        if (attr.isErr)
        {
            return err(attr.error);
        }

        if (funckey)
        {
            let func = attributes.get(funckey);
            if (func == undefined)
            {
                return err(new Error.UnknownVariable(funckey));
            }
            if (func.isErr)
            {
                return err(func.error);
            }

            const input_eval = Evaluate(attr.value, attributes);
            if (input_eval.isErr)
            {
                return err(input_eval.error);
            }

            return EvaluateFunction(func.value, input_eval.value, attributes);
        }

        return Evaluate(attr.value, attributes);
    }
}

export class UnparsedAttrContainer {

    private attributes: ContainerBase<AttrKey, UnparsedAttribute>
    private overrides: ContainerBase<AttrKey, UnparsedOverride>

    constructor() {
        this.attributes = new ContainerBase<AttrKey, UnparsedAttribute>;
        this.overrides = new ContainerBase<AttrKey, UnparsedOverride>;
    }

    public get_attribute(attrkey: AttrKey): MyResult<UnparsedAttribute> {
        const attr = this.attributes.get(attrkey);
        if (attr === undefined) {
            return err(new Error.UnknownVariable(attrkey));
        }
        return ok(attr);
    }

    public has_attribute(key: AttrKey): boolean {
        return this.attributes.has(key);
    }

    public add_attribute(key: AttrKey, value: UnparsedAttribute) {
        this.attributes.set(key, value);
    }

    public rename_attribute(old_key: AttrKey, new_key: AttrKey) {
        this.attributes.rename(old_key, new_key);
    }

    public modify_attribute(key: AttrKey, new_value: UnparsedAttribute) {
        this.attributes.modify(key, new_value);
    }

    public remove_attribute(key: AttrKey) {
        this.attributes.delete(key);
    }

    public forEachAttributeKey(func: (key: AttrKey) => void) {
        this.attributes.forEachKey(func);
    }

    public get_override(attrkey: AttrKey): MyResult<UnparsedOverride> {
        const attr = this.overrides.get(attrkey);
        if (attr === undefined) {
            return err(new Error.UnknownVariable(attrkey));
        }
        return ok(attr);
    }

    public has_override(key: AttrKey): boolean {
        return this.overrides.has(key);
    }

    public add_override(key: AttrKey, value: UnparsedOverride) {
        this.overrides.set(key, value);
    }

    public rename_override(old_key: AttrKey, new_key: AttrKey) {
        this.overrides.rename(old_key, new_key);
    }

    public modify_override(key: AttrKey, new_value: UnparsedOverride) {
        this.overrides.modify(key, new_value);
    }

    public remove_override(key: AttrKey) {
        this.overrides.delete(key);
    }

    public forEachOverrideKey(func: (key: AttrKey) => void) {
        this.overrides.forEachKey(func);
    }

    private do_parse(
        attrkey: AttrKey,
        is_override: boolean, // todo this sucks
        ResolvedVariables: LinkedAttributesDependencies,
        VisitedAttrs: Set<AttrKey>,
        RecurseCount: number
        ): MyResult<ParsedExpression>
        {
            if (RecurseCount > 1000) {
                return err(new Error.Timeout);
            }

            const resolved_var = ResolvedVariables.get(attrkey);
            if (resolved_var !== undefined) {
                return resolved_var;
            }

            if (VisitedAttrs.has(attrkey)) {
                return err(new Error.AttributeCycle(attrkey));
            }

            const attr_result = is_override ? this.get_override(attrkey).map((t) => t.expr) : this.get_attribute(attrkey);
            if (attr_result.isErr) {
                return err(attr_result.error);
            }

            const parse_result = add_context(Parse(attr_result.value), `Parsing "${attr_result.value}"`);
            if (parse_result.isErr) {
                return err(parse_result.error);
            }
            const parsed = parse_result.value;

            VisitedAttrs.add(attrkey);

            const dependencies = parsed.unresolved_variables;
            for (const dependency of dependencies) {
                const result = add_context(
                    this.do_parse(dependency, false, ResolvedVariables, VisitedAttrs, RecurseCount + 1),
                    `Parsing dependency \"${dependency}\"`);
                ResolvedVariables.add(dependency, result);
            }

            VisitedAttrs.delete(attrkey);

            return ok(parsed);
        }

    parse_all(enabled_overrides: Set<AttrKey>): ParsedAttributeContainer {
        let attributes = new LinkedAttributesDependencies();
        this.attributes.forEachKey((attrToLink) => {
            const result = this.do_parse(attrToLink, false, attributes, new Set<AttrKey>, 0);
            attributes.add(attrToLink, result);
        });

        let overrides = new LinkedOverrideDependencies();
        this.overrides.forEach((override, attrToLink) => {
            const result = this.do_parse(attrToLink, true, attributes, new Set<AttrKey>, 0);
            overrides.add(attrToLink, { expr_result: result, override_key: override.override_key });
        })

        return new ParsedAttributeContainer(attributes, overrides, enabled_overrides);
    }
}

export class AttrContainer {
    private unparsed: UnparsedAttrContainer;
    private parsed: ParsedAttributeContainer | null;
    private enabled_overrides: Set<AttrKey>;

    constructor(unparsed: UnparsedAttrContainer, enabled_overrides?: Set<AttrKey>) {
        this.unparsed = unparsed;
        this.parsed = null;
        this.enabled_overrides = enabled_overrides ? enabled_overrides : new Set<AttrKey>;
    }

    set_override_enabled(attrkey: AttrKey, new_enabled: boolean, modify: boolean = true) {
        if (new_enabled) {
            this.enabled_overrides.add(attrkey);
        } else {
            this.enabled_overrides.delete(attrkey);
        }

        if (modify) {
            this.dirty();
        }
    }

    is_override_enabled(attrkey: AttrKey): boolean {
        return this.enabled_overrides.has(attrkey);
    }

    dirty() {
        this.parsed = null;
    }

    get_unparsed(modify: boolean): UnparsedAttrContainer {
        if (modify) { this.dirty() }
        return this.unparsed;
    }

    get_parsed(): ParsedAttributeContainer {
        if (this.parsed === null)
        {
            this.parsed = this.unparsed.parse_all(this.enabled_overrides);
        }
        return this.parsed;
    }
}