import { Component } from "preact";
import * as css from "../pk.module.css";
import { zip_classes } from "./PkFieldHelpers";
import { useCallback, useContext } from "preact/hooks";
import { CS } from "components/app";

type PkTextLabelProps = {
    label: string,
    className?: string,
    onClick?: () => void;
}

export class PkTextLabel extends Component<PkTextLabelProps> {
    render() {
        return <div onClick={this.props.onClick} className={zip_classes(css.pktextfield_label, this.props.className, this.props.onClick ? css.clickable : null)}>
            {this.props.label}
        </div>;
    }
}

type PkAttributeTextLabelProps = {
    label: string,
    className?: string,
    attr_on_click?: string
}

export class PkAttributeTextLabel extends Component<PkAttributeTextLabelProps> {

    render() {

        let { sheet } = useContext(CS);

        if (this.props.attr_on_click !== undefined) {
            const attr = this.props.attr_on_click;

            const printOnClick = useCallback(() => {

                const eval_result_display = sheet.attributes.get_inner().get_parsed().evaluate_attribute(attr);
                
                sheet.chat.mutate((chat) => {
                    chat.add_message_eval_result("Mix", this.props.label, eval_result_display);
                });
                    
                }, [sheet, attr, this.props.label])

            return <div onClick={printOnClick} className={zip_classes(css.pktextfield_label, this.props.className, css.clickable)}>
                {this.props.label}
            </div>;
        }
        else
        {
            return <div className={zip_classes(css.pktextfield_label, this.props.className)}>
                {this.props.label}
            </div>;
        }

    }
}