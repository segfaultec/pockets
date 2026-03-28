
import { Component } from "preact";
import * as css from "./boxfields.module.css"
import PkAttributeTextLabel from "components/Text/PkAttributeTextLabel";
import PkAttributeEditorField from "components/Text/PkAttributeEditorField";
import PkAttributeViewerField from "components/Text/PkAttributeViewerField";

type PkStatsBoxFieldProps = {
    base_key: string,
    mod_key: string,
    label: string
}

export class PkStatsBoxField extends Component<PkStatsBoxFieldProps> {
    render() {
        return <div className={css.pkstatsbox}>
            <PkAttributeTextLabel label={this.props.label} attr_on_click={this.props.base_key}/>
            <div>
            <PkAttributeViewerField 
                my_key={this.props.mod_key}
                className={css.bignumber}
                modifier
                run_func="roll"
                run_header={`${this.props.label} Check`}
                />
            </div>
            <PkAttributeEditorField
                my_key={this.props.base_key}/>
        </div>;
    }
}