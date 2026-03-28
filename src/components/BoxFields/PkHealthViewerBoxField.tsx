
import { Component } from "preact";
import * as css from "./boxfields.module.css"
import PkTextLabel from "components/Text/PkTextLabel";
import PkAttributeEditorField from "components/Text/PkAttributeEditorField";

type PkHealthViewerFieldProps = {
    current_key: string,
    max_key: string,
    label: string
}

export default class PkHealthViewerBoxField extends Component<PkHealthViewerFieldProps> {
    render() {
        return <div className={css.pkhealthbox}>
            <PkAttributeEditorField
                my_key={this.props.current_key} className={css.bignumber} always_edit number />
            <PkAttributeEditorField
                my_key={this.props.max_key} always_edit number/>
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}