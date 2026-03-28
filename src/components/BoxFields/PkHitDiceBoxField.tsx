import { Component } from "preact";
import * as css from "components/pk.module.css"
import PkTextLabel from "components/Text/PkTextLabel";
import PkAttributeEditorField from "components/Text/PkAttributeEditorField";

type PkHitDiceBoxFieldProps = {
    current_key: string,
    max_key: string,
    size_key: string,
    label: string
}

export default class PkHitDiceBoxField extends Component<PkHitDiceBoxFieldProps> {
    render() {
        return <div className={css.pkhitdicebox}>
            <div className={css.pkhitdicebox_inner}>
                <PkAttributeEditorField
                    my_key={this.props.current_key}
                    always_edit number />
                <button className={css.pkhitidcebox_divider} >/</button>
                <PkAttributeEditorField
                    my_key={this.props.max_key}/>
                <button>d</button>
                <PkAttributeEditorField
                    my_key={this.props.size_key} number />
            </div>
            
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}