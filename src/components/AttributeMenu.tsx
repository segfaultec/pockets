
import * as style from "./AttributeMenu.module.css"

import { AttrContainer, AttrKey, OverrideKey } from "lib/attribute";
import { Component } from "preact";
import { ParsedExpression } from "lib/diceroll/mod";
import { JSXInternal } from "preact/src/jsx";
import { useContext, useMemo, useState } from "preact/hooks";

import { CS } from "./app";
import SignalWrapper from "./utils/SignalWrapper";
import { useSignal } from "@preact/signals";
import { just } from "true-myth/dist/es/maybe";
import PkCheckbox from "./library/PkCheckbox";

type AttributeMenuElementProps = {
    my_key: string,
    attributes: SignalWrapper<AttrContainer>
};

type AttributeMenuElementProps_Override = {
    attribute_key: AttrKey,
    override_key: OverrideKey,
    attributes: SignalWrapper<AttrContainer>
};

class AttributeMenuElement_Override extends Component<AttributeMenuElementProps_Override, {}> {
    render() {

        const { sheet } = useContext(CS);

        /*
        * Could use state to update our key without rerendering every other entry
        * but this causes issues with deletion since the state isn't reset.
        */
        //const [ key, setKey ] = useState(this.props.my_key);
        const attribute_key = this.props.attribute_key;
        const override_key = this.props.override_key;
        const unparsed = this.props.attributes.get_inner().get_unparsed(false);

        const override = unparsed.get_override(attribute_key, override_key);
        const override_value = override.unwrapOr("Error!");

        const override_enabled = this.props.attributes.get_inner().is_override_enabled(attribute_key, override_key);

        return <div>
            <input type="text" value={attribute_key} onChange={(event)=>{
                this.props.attributes.mutate((inner) => {
                    inner.get_unparsed(true).rename_override(attribute_key, override_key, event.currentTarget.value);
                }, true); // <- rerender parent since we aren't using state

                //setKey(event.currentTarget.value);
            }}/>
            <input type="text" value={override_key}></input>
            <input type="text" value={override_value} onChange={(event)=>{
                if (event.currentTarget.value !== override_value) {

                    this.props.attributes.mutate((inner) => {
                        inner.get_unparsed(true).modify_override(attribute_key, override_key, event.currentTarget.value);
                    }, false);

                    this.forceUpdate();
                }
            }}/>
            <input type="checkbox" checked={override_enabled} onChange={(event) => {
                this.props.attributes.mutate((inner) => {
                    inner.set_override(attribute_key, override_enabled ? null : override_key);
                })
            }}></input>
            <button onClick={() => {
                this.props.attributes.mutate((inner) => {
                    inner.get_unparsed(true).remove_override(attribute_key, override_key);
                });
            }}>Delete</button>
        </div>;
    }
}

class AttributeMenuElement_Attribute extends Component<AttributeMenuElementProps, {}> {

    render() {

        const { sheet } = useContext(CS);

        /*
        * Could use state to update our key without rerendering every other entry
        * but this causes issues with deletion since the state isn't reset.
        */
        //const [ key, setKey ] = useState(this.props.my_key);
        const key = this.props.my_key;

        const unparsed = this.props.attributes.get_inner().get_unparsed(false);

        const expr = unparsed.get_attribute(key).map((t) => t.expr).unwrapOr("Error!");

        return <div>
            <input type="text" value={key} onChange={(event)=>{
                this.props.attributes.mutate((inner) => {
                    inner.get_unparsed(true).rename_attribute(key, event.currentTarget.value);
                }, true); // <- rerender parent since we aren't using state

                //setKey(event.currentTarget.value);
            }}/>
            <input type="text" value={expr} onChange={(event)=>{
                if (event.currentTarget.value !== expr) {

                    this.props.attributes.mutate((inner) => {
                        inner.get_unparsed(true).modify_attribute(key, event.currentTarget.value);
                    }, false);

                    this.forceUpdate();
                }
            }}/>
            <button onClick={() => {

                const this_eval = sheet.attributes.get_inner().evaluate_attribute(key, undefined);

                sheet.chat.mutate((chat) => {
                    chat.add_message_eval_result("Mix", `Attribute "${key}"`, this_eval);
                })
                sheet.last_ran_expr.set_inner(just(this_eval));

            }}>Eval</button>
            <button onClick={() => {
                this.props.attributes.mutate((inner) => {
                    inner.get_unparsed(true).remove_attribute(key);
                });
            }}>Delete</button>
        </div>;
    }
}

type AttributeMenuProps = {
    attributes: SignalWrapper<AttrContainer>;
}

class AttributeMenu extends Component<AttributeMenuProps> {

    render() {
        const attribute_elements: JSXInternal.Element[] = [];

        this.props.attributes.get_inner().get_unparsed(false).forEachAttributeKey((key) => {
            attribute_elements.push(
                <AttributeMenuElement_Attribute my_key={key} attributes={this.props.attributes} />
            )
        });

        const override_elements: JSXInternal.Element[] = [];
        this.props.attributes.get_inner().get_unparsed(false).forEachOverrideKey((attribute_key, override_key) => {
            override_elements.push(
                <AttributeMenuElement_Override attribute_key={attribute_key} override_key={override_key} attributes={this.props.attributes} />
            )
        });

        return (
            <div>
                <h3>Attributes</h3>
                {attribute_elements}
                <button onClick={() => {
                    this.props.attributes.mutate((inner) => {
                        const unparsed = inner.get_unparsed(false);
                        let count = 0
                        while (count++ < 1000) {
                            const name = "new" + count;
                            if (!unparsed.has_attribute(name)) {
                                inner.dirty();
                                unparsed.add_attribute(name, "0");
                                return;
                            }
                        }
                    })

                }}>Add</button>
                <h3>Overrides</h3>
                {override_elements}
                <button onClick={() => {

                }}>Add</button>
            </div>
        );
    }

}

export default AttributeMenu;