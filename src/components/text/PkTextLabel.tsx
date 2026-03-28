import { Component } from "preact";
import * as css from "components/pk.module.css";
import { zip_classes } from "components/utils/FieldHelpers";

type PkTextLabelProps = {
    label: string,
    className?: string,
    onClick?: () => void;
}

export default class PkTextLabel extends Component<PkTextLabelProps> {
    render() {
        return <div onClick={this.props.onClick} className={zip_classes(css.pktextfield_label, this.props.className, this.props.onClick ? css.clickable : null)}>
            {this.props.label}
        </div>;
    }
}

