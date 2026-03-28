import { Component } from "preact";
import { CS } from "components/app";
import { useContext } from "preact/hooks";
import * as css from "components/pk.module.css"
import { ok } from "true-myth/dist/es/result";


type PkAttributeViewerFieldProps = {
    my_key: string,
    className?: string,
    modifier?: boolean,
    suffix?: string,
    run_func?: string,
    run_header: string
} 

export default class PkAttributeViewerField extends Component<PkAttributeViewerFieldProps> {

    render() {
        let { sheet } = useContext(CS);

        const eval_result_display = sheet.attributes.get_inner().evaluate_attribute(this.props.my_key, undefined);

        const eval_display_result = eval_result_display.andThen((expr) => {
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

        let onClick: () => void;

        if (this.props.run_func) {

            // Run func = evaluation
            onClick = () => {
                const eval_result_display = sheet.attributes.get_inner().evaluate_attribute(this.props.my_key, this.props.run_func);

                sheet.chat.mutate((chat) => {
                    chat.add_message_eval_result("Mix", this.props.run_header, eval_result_display);
                });
            }

        } else {

            // No run func = printout
            onClick = () => {
                sheet.chat.mutate((chat) => {
                    chat.add_message_print_field("Mix", this.props.run_header, eval_display_value);
                });
            }
        }

        return <div className={this.props.className}>
            <div className={css.pktextfield_container}>
            <button
                onClick={onClick}>
                <span>{eval_display_value.replaceAll(' ', '\u00a0')}</span>
            </button>
        </div></div>;
    }
}
