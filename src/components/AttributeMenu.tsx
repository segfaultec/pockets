
import * as style from "./AttributeMenu.module.css"

import { AttrContainer } from "lib/attribute";
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

class AttributeMenuElement_Override extends Component<AttributeMenuElementProps, {}> {
    render() {

        const { sheet } = useContext(CS);

        /*
        * Could use state to update our key without rerendering every other entry
        * but this causes issues with deletion since the state isn't reset.
        */
        //const [ key, setKey ] = useState(this.props.my_key);
        const key = this.props.my_key;

        const unparsed = this.props.attributes.get_inner().get_unparsed(false);

        const override = unparsed.get_override(key);
        const override_value = override.map((t) => t.expr).unwrapOr("Error!");
        const override_targetkey = override.map((t) => t.override_key).unwrapOr("Error!");

        const override_enabled = this.props.attributes.get_inner().is_override_enabled(key);

        return <div>
            <input type="text" value={key} onChange={(event)=>{
                this.props.attributes.mutate((inner) => {
                    inner.get_unparsed(true).rename_override(key, event.currentTarget.value);
                }, true); // <- rerender parent since we aren't using state

                //setKey(event.currentTarget.value);
            }}/>
            <input type="text" value={override_targetkey}></input>
            <input type="text" value={override_value} onChange={(event)=>{
                if (event.currentTarget.value !== override_value) {

                    this.props.attributes.mutate((inner) => {
                        inner.get_unparsed(true).modify_override(key, {expr: event.currentTarget.value, override_key: override_targetkey});
                    }, false);

                    this.forceUpdate();
                }
            }}/>
            <input type="checkbox" checked={override_enabled} onChange={(event) => {
                this.props.attributes.mutate((inner) => {
                    inner.set_override_enabled(key, !override_enabled);
                })
            }}></input>
            <button onClick={() => {
                this.props.attributes.mutate((inner) => {
                    inner.get_unparsed(true).remove_override(key);
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

        const expr = unparsed.get_attribute(key).unwrapOr("Error!");

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

                const this_eval = sheet.attributes.get_inner().get_parsed().evaluate_attribute(key);

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
        this.props.attributes.get_inner().get_unparsed(false).forEachOverrideKey((key) => {
            override_elements.push(
                <AttributeMenuElement_Override my_key={key} attributes={this.props.attributes} />
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