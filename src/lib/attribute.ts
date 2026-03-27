import { Parse, Evaluate, UnparsedExpression, ParsedExpression, EvaluatedExpression, EvaluateFunction } from "lib/diceroll/mod";

import { MyResult, add_context } from "./errors";
import * as Error from './errors';
import { ok, err } from "true-myth/dist/es/result";
import { ContainerBase } from "./ContainerBase";

export type AttrKey = string;
export type OverrideKey = string;

type UnparsedOverride = {
    expr: UnparsedExpression,
}

type UnparsedAttribute = {
    expr: UnparsedExpression,
    overrides?: ContainerBase<OverrideKey, UnparsedExpression>
};

type ParsedOverride = {
    expr: ParsedExpression,
}

type ParsedAttribute = {
    expr: ParsedExpression,
    overrides?: ContainerBase<OverrideKey, MyResult<ParsedOverride>>
};

export class ParsedAttributeContainer {
    private attributes: ContainerBase<AttrKey, MyResult<ParsedAttribute>> = new ContainerBase;

    private constructor() {}

    private do_parse(
        attrkey: AttrKey,
        override_key: OverrideKey | null,
        all_unparsed_attributes: UnparsedAttrContainer,
        VisitedAttrs: Set<AttrKey>,
        RecurseCount: number
        ): MyResult<ParsedAttribute>
    {
        if (RecurseCount > 1000) {
            return err(new Error.Timeout);
        }

        const resolved_var = this.attributes.get(attrkey);
        if (resolved_var !== undefined) {
            return resolved_var;
        }

        if (VisitedAttrs.has(attrkey)) {
            return err(new Error.AttributeCycle(attrkey));
        }

        const attr_result = all_unparsed_attributes.get_attribute(attrkey);
        if (attr_result.isErr) {
            return err(attr_result.error);
        }

        let attr_expr: UnparsedExpression;
        if (override_key) {
            const override_expr = attr_result.value.overrides?.get(override_key);
            if (override_expr === undefined) {
                return err(new Error.UnknownOverrideKey(attrkey, override_key));
            }
            attr_expr = override_expr;
        } else {
            attr_expr = attr_result.value.expr;
        }

        const parse_result = add_context(Parse(attr_expr), `Parsing "${attr_expr}"`);
        if (parse_result.isErr) {
            return err(parse_result.error);
        }
        const parsed_base_expr = parse_result.value;
        let parsed_override_exprs: ContainerBase<OverrideKey, MyResult<ParsedOverride>> | undefined = undefined;

        if (attr_result.value.overrides !== undefined && override_key === null) {
            attr_result.value.overrides.forEachKey((override_key) => {
                const result = add_context(
                    this.do_parse(attrkey, override_key, all_unparsed_attributes, VisitedAttrs, RecurseCount + 1),
                    `Parsing override expr ${override_key} for attribute ${attrkey}`
                )

                if (parsed_override_exprs === undefined) {
                    parsed_override_exprs = new ContainerBase;
                }

                parsed_override_exprs.add(override_key, result);
            })
        }

        VisitedAttrs.add(attrkey);

        const dependencies = parsed_base_expr.unresolved_variables;
        for (const dependency of dependencies) {
            const result = add_context(
                this.do_parse(dependency, null, all_unparsed_attributes, VisitedAttrs, RecurseCount + 1),
                `Parsing dependency \"${dependency}\"`);

            this.attributes.add(dependency, result)
        }

        VisitedAttrs.delete(attrkey);

        return ok({
            expr: parsed_base_expr,
            overrides: parsed_override_exprs
        });
    }

    public static parse_all(unparsed: UnparsedAttrContainer): ParsedAttributeContainer {
        let attributes = new ParsedAttributeContainer();
        unparsed.forEachAttributeKey((attrToLink) => {
            const result = attributes.do_parse(attrToLink, null, unparsed, new Set<AttrKey>, 0);
            attributes.attributes.add(attrToLink, result);
        });

        return attributes;
    }

    public get_attribute_expression(attribute_key: AttrKey, active_overrides: Map<AttrKey, OverrideKey>): MyResult<ParsedExpression> {

        let result = (): MyResult<ParsedExpression> => {

            const attr = this.attributes.get(attribute_key);
            if (attr === undefined) {
                return err(new Error.UnknownVariable(attribute_key));
            }

            if (attr.isErr) {
                return err(attr.error);
            }

            const override_key = active_overrides.get(attribute_key);
            if (override_key === undefined) {
                return ok(attr.value.expr);
            } else {
                const override_expr = attr.value.overrides?.get(override_key);
                if (override_expr === undefined) {
                    return err(new Error.UnknownOverrideKey(attribute_key, override_key));
                }
                if (override_expr.isErr) {
                    return err(override_expr.error);
                }
                return ok(override_expr.value.expr);
            }
        }

        return add_context(result(), `Resolving attribute ${attribute_key} in LinkedAttributesDependencies`);
    }
}

export class UnparsedAttrContainer {

    private attributes: ContainerBase<AttrKey, UnparsedAttribute>

    constructor() {
        this.attributes = new ContainerBase<AttrKey, UnparsedAttribute>;
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

    public add_attribute(key: AttrKey, value: UnparsedExpression) {
        this.attributes.set(key, {expr: value});
    }

    public rename_attribute(old_key: AttrKey, new_key: AttrKey) {
        this.attributes.rename(old_key, new_key);
    }

    public modify_attribute(key: AttrKey, new_value: UnparsedExpression) {
        this.attributes.modify(key, {expr: new_value});
    }

    public remove_attribute(key: AttrKey) {
        this.attributes.delete(key);
    }

    public forEachAttributeKey(func: (key: AttrKey) => void) {
        this.attributes.forEachKey(func);
    }

    public forEachOverrideKey(func: (attribute_key: AttrKey, override_key: OverrideKey) => void) {
        this.attributes.forEach((attribute, attribute_key) => {
            if (attribute.overrides !== undefined) {
                attribute.overrides.forEachKey((override_key) => { func(attribute_key, override_key); })
            } 
        });
    }

    public get_override(attrkey: AttrKey, override_key: OverrideKey): MyResult<UnparsedExpression> {
        const attr = this.attributes.get(attrkey);
        if (attr === undefined) {
            return err(new Error.UnknownVariable(attrkey));
        }
        const override = attr.overrides?.get(override_key);
        if (override === undefined) {
            return err(new Error.UnknownOverrideKey(attrkey, override_key));
        }

        return ok(override);
    }

    public has_override(attribute_key: AttrKey, override_key: OverrideKey): boolean {
        const attr = this.attributes.get(attribute_key);
        return attr !== undefined && attr.overrides !== undefined && attr.overrides.has(override_key);
    }

    public add_override(attribute_key: AttrKey, override_key: OverrideKey, value: UnparsedExpression) {
        let attr = this.attributes.get(attribute_key);
        if (attr !== undefined) {
            if (attr.overrides === undefined) {
                attr.overrides = new ContainerBase;
            }
            attr.overrides.set(override_key, value);
        }
    }

    public rename_override(attribute_key: AttrKey, old_key: AttrKey, new_key: AttrKey) {
        let attr = this.attributes.get(attribute_key);
        if (attr !== undefined && attr.overrides !== undefined) {
            attr.overrides.rename(old_key, new_key);
        }
    }

    public modify_override(attribute_key: AttrKey, override_key: AttrKey, new_value: UnparsedExpression) {
        let attr = this.attributes.get(attribute_key);
        if (attr !== undefined && attr.overrides !== undefined) {
            attr.overrides.modify(override_key, new_value);
        }
    }

    public remove_override(attribute_key: AttrKey, override_key: AttrKey) {
        let attr = this.attributes.get(attribute_key);
        if (attr !== undefined && attr.overrides !== undefined) {
            attr.overrides.delete(override_key);
        }
    }
}

export class AttrContainer {
    private unparsed: UnparsedAttrContainer;
    private parsed: ParsedAttributeContainer | null;
    private active_overrides: Map<AttrKey, OverrideKey>;

    constructor(unparsed: UnparsedAttrContainer, enabled_overrides?: Map<AttrKey, OverrideKey>) {
        this.unparsed = unparsed;
        this.parsed = null;
        this.active_overrides = enabled_overrides ? enabled_overrides : new Map<AttrKey, OverrideKey>;
    }

    set_override(attrkey: AttrKey, new_override_key: OverrideKey | null, modify: boolean = true) {
        if (new_override_key !== null) {
            this.active_overrides.set(attrkey, new_override_key);
        } else {
            this.active_overrides.delete(attrkey);
        }

        if (modify) {
            this.dirty();
        }
    }

    get_override(attrkey: AttrKey): OverrideKey | null {
        const override = this.active_overrides.get(attrkey);
        if (override === undefined) { return null; }
        return override;
    }

    is_override_enabled(attrkey: AttrKey, override_key: OverrideKey): boolean {
        return this.active_overrides.get(attrkey) === override_key;
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
            this.parsed = ParsedAttributeContainer.parse_all(this.unparsed);
        }
        return this.parsed;
    }

    public evaluate_expression(expr: ParsedExpression): MyResult<EvaluatedExpression> {
        return Evaluate(expr, this.get_parsed(), this.active_overrides);
    }

    public evaluate_attribute(attrkey: AttrKey, funckey: AttrKey | undefined): MyResult<EvaluatedExpression> {

        let parsed = this.get_parsed();

        let attr = parsed.get_attribute_expression(attrkey, this.active_overrides);
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
            let func = parsed.get_attribute_expression(funckey, this.active_overrides);
            if (func == undefined)
            {
                return err(new Error.UnknownVariable(funckey));
            }
            if (func.isErr)
            {
                return err(func.error);
            }

            const input_eval = Evaluate(attr.value, parsed, this.active_overrides);
            if (input_eval.isErr)
            {
                return err(input_eval.error);
            }

            return EvaluateFunction(func.value, input_eval.value, parsed, this.active_overrides);
        }

        return Evaluate(attr.value, parsed, this.active_overrides);
    }
}