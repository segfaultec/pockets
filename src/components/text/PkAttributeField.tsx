import { CharsheetApp } from "components/charsheet_app";
import { Component } from "preact";
import { CS } from "components/app";
import { useContext } from "preact/hooks";
import * as Helpers from "./PkFieldHelpers"
import * as css from "../pk.module.css"
import { MyResult } from "lib/errors";
import { err, ok } from "true-myth/dist/es/result";

type PkAttributeEditorFieldProps = {
    my_key: string,
    className?: string
    number?: boolean,
    always_edit?: boolean
}

export class PkAttributeEditorField extends Component<PkAttributeEditorFieldProps> {

    render() {
        let { sheet } = useContext(CS);

        const field_result = Helpers.get_attr_value(sheet, this.props.my_key);
        const field_value = field_result.unwrapOr("Err!");

        const edit_mode = field_result.isOk
            && (this.props.always_edit || Helpers.is_edit_mode_enabled(sheet));

            return <div className={Helpers.zip_classes(css.pktextfield_container, this.props.className)}>
            <input className={edit_mode ? "" : css.invisible}
                value={field_value}
                type={this.props.number ? "number" : "text"} 
                onInput={(event: any) => {
                    Helpers.set_attr_value(sheet, this.props.my_key, event.target.value);
                }}
            />
            <button className={edit_mode ? css.invisible : ""}
                onClick={ () => {
                    // Todo send error on error
                    sheet.chat.mutate((chat) => {
                        chat.add_message_print_field("Mix", this.props.my_key, field_value);
                    });
                }}>
                <span>{field_value.replaceAll(' ', '\u00a0')}</span>
            </button>
        </div>;
    }
}

type PkAttributeViewerFieldProps = {
    my_key: string,
    className?: string,
    modifier?: boolean,
    suffix?: string
} 

export class PkAttributeViewerField extends Component<PkAttributeViewerFieldProps> {

    render() {
        let { sheet } = useContext(CS);

        const attr_value = Helpers.get_attr_value(sheet, this.props.my_key);
        const eval_result = sheet.attributes.get_inner().get_parsed().evaluate_attribute(this.props.my_key);

        const eval_display_result = eval_result.andThen((expr) => {
            const total = expr.total;

            let out_str = total.toString();

            if (total >= 0 && this.props.modifier) {
                out_str = '+' + out_str;
            }
            if (this.props.suffix !== undefined) {
                out_str = out_str + this.props.suffix;
            }

            return ok(out_str);

        });

        const eval_display_value = eval_display_result.unwrapOr("Err!");

        return <div className={this.props.className}>
            <div className={css.pktextfield_container}>
            <button
                onClick={ () => {

                    sheet.chat.mutate((chat) => {
                        chat.add_message_print_field("Mix", `${this.props.my_key}`, eval_display_value);
                    });
                }}>
                <span>{eval_display_value.replaceAll(' ', '\u00a0')}</span>
            </button>
        </div></div>;
    }
}
