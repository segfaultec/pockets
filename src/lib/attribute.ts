import { Parse, Evaluate, UnparsedExpression, ParsedExpression, EvaluatedExpression, EvaluateFunction } from "lib/diceroll/mod";

import { MyResult, add_context } from "./errors";
import * as Error from './errors';
import { ok, err } from "true-myth/dist/es/result";
import { ContainerBase } from "./ContainerBase";

type AttrKey = string;
type Attribute = UnparsedExpression;

type LinkedAttributesDependencies = ContainerBase<AttrKey, MyResult<ParsedExpression>>;

export class ParsedAttributeContainer {

    private attributes: LinkedAttributesDependencies

    constructor(attributes: LinkedAttributesDependencies) {
        this.attributes = attributes;
    }

    public evaluate_expression(expr: ParsedExpression): MyResult<EvaluatedExpression> {
        return Evaluate(expr, this.attributes);
    }

    public evaluate_attribute(attrkey: AttrKey, funckey?: AttrKey): MyResult<EvaluatedExpression> {
        let attr = this.attributes.get(attrkey);
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
            let func = this.attributes.get(funckey);
            if (func == undefined)
            {
                return err(new Error.UnknownVariable(funckey));
            }
            if (func.isErr)
            {
                return err(func.error);
            }

            const input_eval = Evaluate(attr.value, this.attributes);
            if (input_eval.isErr)
            {
                return err(input_eval.error);
            }

            return EvaluateFunction(func.value, input_eval.value, this.attributes);
        }

        return Evaluate(attr.value, this.attributes);
    }
}

export class UnparsedAttrContainer {

    private attributes: ContainerBase<AttrKey, Attribute>

    constructor() {
        this.attributes = new ContainerBase<AttrKey, Attribute>;
    }

    public get_attribute(attrkey: AttrKey): MyResult<Attribute> {
        const attr = this.attributes.get(attrkey);
        if (attr === undefined) {
            return err(new Error.UnknownVariable(attrkey));
        }
        return ok(attr);
    }

    public has_attribute(key: AttrKey): boolean {
        return this.attributes.has(key);
    }

    public add_attribute(key: AttrKey, value: Attribute) {
        this.attributes.set(key, value);
    }

    public rename_attribute(old_key: AttrKey, new_key: AttrKey) {
        this.attributes.rename(old_key, new_key);
    }

    public modify_attribute(key: AttrKey, new_value: Attribute) {
        this.attributes.modify(key, new_value);
    }

    public remove_attribute(key: AttrKey) {
        this.attributes.delete(key);
    }

    public forEachKey(func: (key: AttrKey) => void) {
        this.attributes.forEachKey(func);
    }

    private do_parse(
        attrkey: AttrKey,
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

            const attr_result = this.get_attribute(attrkey);
            if (attr_result.isErr) {
                return err(attr_result.error);
            }

            const parse_result = Parse(attr_result.value);
            if (parse_result.isErr) {
                return err(parse_result.error);
            }
            const parsed = parse_result.value;

            VisitedAttrs.add(attrkey);

            const dependencies = parsed.unresolved_variables;
            for (const dependency of dependencies) {
                const result = add_context(
                    this.do_parse(dependency, ResolvedVariables, VisitedAttrs, RecurseCount + 1),
                    `Parsing dependency \"${dependency}\"`);
                ResolvedVariables.add(dependency, result);
            }

            VisitedAttrs.delete(attrkey);

            return ok(parsed);
        }

    parse_all(): ParsedAttributeContainer {
        let dependencies = new ContainerBase<AttrKey, MyResult<ParsedExpression>>();

        this.forEachKey((attrToLink) => {
            const result = this.do_parse(attrToLink, dependencies, new Set<AttrKey>, 0);
            dependencies.add(attrToLink, result);
        });

        return new ParsedAttributeContainer(dependencies);
    }
}

export class AttrContainer {
    private unparsed: UnparsedAttrContainer;
    private parsed: ParsedAttributeContainer | null;

    constructor(unparsed: UnparsedAttrContainer) {
        this.unparsed = unparsed;
        this.parsed = null;
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
            this.parsed = this.unparsed.parse_all();
        }
        return this.parsed;
    }
}