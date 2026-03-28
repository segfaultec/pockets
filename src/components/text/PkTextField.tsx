import { Component } from "preact";
import { useContext } from "preact/hooks";
import { CS } from "components/App";

import * as css from "./text.module.css";
import * as Helpers from "components/utils/FieldHelpers";

type PkTextFieldProps = {
    my_key: string,
    className?: string,
    run_header: string
}

export default class PkTextField extends Component<PkTextFieldProps> {

    render_field() {

        let { sheet } = useContext(CS);

        const field_result = Helpers.get_text_field_value(sheet, this.props.my_key);
        const field_value = field_result.unwrapOr("Err!");

        const edit_mode = field_result.isOk
            && Helpers.is_edit_mode_enabled(sheet);

        return <div className={css.pktextfield_container}>
            <input
                aria-hidden={!edit_mode}
                value={field_value}
                type="text"
                onInput={(event: any) => {
                    Helpers.set_text_field_value(sheet, this.props.my_key, event.target.value);
                }}
            />
            <button
                aria-hidden={edit_mode}
                onClick={ () => {

                    // Todo send error on error
                    sheet.chat.mutate((chat) => {
                        chat.add_message_print_field("Mix", this.props.run_header, field_value);
                    });
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