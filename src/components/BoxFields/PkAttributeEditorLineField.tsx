
import { Component } from "preact";
import * as css from "./boxfields.module.css"
import PkAttributeTextLabel from "components/Text/PkAttributeTextLabel";
import PkAttributeEditorField from "components/Text/PkAttributeEditorField";

type PkAttributeEditorFieldProps = {
    my_key: string,
    label: string,
}

export default class PkAttributeEditorLineField extends Component<PkAttributeEditorFieldProps> {
    render() {
        return <div className={css.pkattrline}>
            <PkAttributeEditorField
                my_key={this.props.my_key}
                className={css.bignumber}/>
            <PkAttributeTextLabel label={this.props.label} attr_on_click={this.props.my_key} />
        </div>;
    }
}

