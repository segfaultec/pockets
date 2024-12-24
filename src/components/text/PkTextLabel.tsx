import { Component } from "preact";
import * as css from "../pk.module.css";

type PkTextLabelProps = {
    label: string
}

export class PkTextLabel extends Component<PkTextLabelProps> {
    render() {
        return <div className={css.pktextfield_label}>{this.props.label}</div>;
    }
}