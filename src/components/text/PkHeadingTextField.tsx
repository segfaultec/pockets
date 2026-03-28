import { Component } from "preact";

import * as css from "./text.module.css";
import * as Helpers from "components/utils/FieldHelpers";
import PkLabelField from "./PkLabelField";
import PkTextLabel from "./PkTextLabel";

type PkHeadingTextFieldProps = {
    my_key: string,
    label: string,
    className?: string
}


export default class PkHeadingTextField extends Component<PkHeadingTextFieldProps> {

    render() {
        return <div className={Helpers.zip_classes(css.pktextfield_heading, this.props.className)}>
            <PkLabelField my_key={this.props.my_key} run_header={this.props.label} />
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}

