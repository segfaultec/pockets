import { Component } from "preact";
import * as css from "./text.module.css";
import { zip_classes } from "components/utils/FieldHelpers";

type PkTextLabelProps = {
    label: string,
    className?: string,
    onClick?: () => void;
    centered?: boolean
}

export default class PkTextLabel extends Component<PkTextLabelProps> {
    render() {
        return <div onClick={this.props.onClick} className={
            zip_classes(
                css.labelfield_label,
                this.props.className,
                this.props.onClick ? css.clickable : null,
                this.props.centered ? css.centered : null
                )}>
            {this.props.label}
        </div>;
    }
}

