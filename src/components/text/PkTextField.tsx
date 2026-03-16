import { Component, JSX } from "preact";
import { useContext } from "preact/hooks";
import { CS } from "../app";

import * as css from "../pk.module.css";
import { CharsheetApp } from "components/charsheet_app";
import * as Helpers from "./PkFieldHelpers";
import { PkTextLabel } from "./PkTextLabel";

type PkTextFieldProps = {
    my_key: string,
    className?: string
}

export default class PkTextField extends Component<PkTextFieldProps> {

    render_field() {

        let { sheet } = useContext(CS);

        const field_result = Helpers.get_text_field_value(sheet, this.props.my_key);
        const field_value = field_result.unwrapOr("Err!");

        const edit_mode = field_result.isOk
            && Helpers.is_edit_mode_enabled(sheet);

        return <div className={css.pktextfield_container}>
            <input className={edit_mode ? "" : css.invisible}
                value={field_value}
                type="text"
                onInput={(event: any) => {
                    Helpers.set_text_field_value(sheet, this.props.my_key, event.target.value);
                }}
            />
            <button className={edit_mode ? css.invisible : ""}
                onClick={ () => {
                    console.log(field_value);
                }}>
                <span>{field_value.replaceAll(' ', '\u00a0')}</span>
            </button>
        </div>;
    }

    render() {
        return <div className={Helpers.zip_classes(css.pktextfield, this.props.className)}>
            {this.render_field()}
            </div>
    }
}

type PkHeadingTextFieldProps = {
    my_key: string,
    label: string,
    className?: string
}

export class PkHeadingTextField extends Component<PkHeadingTextFieldProps> {

    render() {
        return <div className={Helpers.zip_classes(css.pktextfield_heading, this.props.className)}>
            <PkTextField my_key={this.props.my_key} />
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}

