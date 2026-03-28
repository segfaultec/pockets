import { CS } from "components/App";
import { Component } from "preact"
import { useContext } from "preact/hooks";
import * as Helpers from "components/utils/FieldHelpers"
import * as css from "./switch.module.css"

export type PkSwitchProps = {
    my_key: string,
    className?: string
}

export default class PkSwitch extends Component<PkSwitchProps> {
    render() {
        let { sheet } = useContext(CS);

        const field_result = Helpers.get_attr_value(sheet, this.props.my_key);

        const field_value = field_result.unwrapOr("0") == "1";

        return <div className={Helpers.zip_classes(css.pkswitch, this.props.className)}>
            <input type="checkbox"
                checked={field_value}
                readonly={field_result.isErr}
                onInput={(event: any) => {
                    const value = event.target.checked ? "1" : "0";
                    Helpers.set_attr_value(sheet, this.props.my_key, value);
                }}/>
        </div>;
    }
}