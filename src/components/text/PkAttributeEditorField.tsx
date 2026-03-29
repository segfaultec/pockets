
import { Component } from "preact";
import { CS } from "components/App";
import { useContext } from "preact/hooks";
import * as Helpers from "components/utils/FieldHelpers"
import * as css from "./text.module.css";

type PkAttributeEditorFieldProps = {
    my_key: string,
    className?: string
    number?: boolean,
    always_edit?: boolean
}

export default class PkAttributeEditorField extends Component<PkAttributeEditorFieldProps> {

    render() {
        let { sheet } = useContext(CS);

        const field_result = Helpers.get_attr_value(sheet, this.props.my_key);
        const field_value = field_result.unwrapOr("Err!");

        const edit_mode = field_result.isOk
            && (this.props.always_edit || Helpers.is_edit_mode_enabled(sheet));

            return <div className={Helpers.zip_classes(css.labelfield_container, this.props.className)}>
            <input
                aria-hidden={!edit_mode}
                value={field_value}
                type={this.props.number ? "number" : "text"} 
                onInput={(event: any): void => {
                    let value: string = event.target.value;
                    // event.preventDefault();
                    // if (this.props.number && value.) {

                    // }

                    Helpers.set_attr_value(sheet, this.props.my_key, event.target.value);
                }}
            />
            <button
                aria-hidden={edit_mode}
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