import { Component } from "preact";

import * as css from "components/pk.module.css";
import * as Helpers from "components/utils/FieldHelpers";
import PkTextField from "./PkTextField";
import PkTextLabel from "./PkTextLabel";

type PkHeadingTextFieldProps = {
    my_key: string,
    label: string,
    className?: string
}


export default class PkHeadingTextField extends Component<PkHeadingTextFieldProps> {

    render() {
        return <div className={Helpers.zip_classes(css.pktextfield_heading, this.props.className)}>
            <PkTextField my_key={this.props.my_key} run_header={this.props.label} />
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}

