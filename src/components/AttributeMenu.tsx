
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

type AttributeMenuElementProps = {
    my_key: string,
    attributes: SignalWrapper<AttrContainer>
};

class AttributeMenuElement extends Component<AttributeMenuElementProps, {}> {

    constructor() {
        super();
    }

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

                const chat_message: string = this_eval.mapOr("Error!",
                    (exp) => `${key}: ${exp.total.toString()}`);

                sheet.chat.mutate((chat) => {
                    chat.add_message("Eval", chat_message);
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
        const elements: JSXInternal.Element[] = [];

        this.props.attributes.get_inner().get_unparsed(false).forEachKey((key) => {
            elements.push(
                <AttributeMenuElement my_key={key} attributes={this.props.attributes} />
            )
        });

        return (
            <div>
                {elements}
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
            </div>
        );
    }

}

export default AttributeMenu;