
import PkTriSwitch from "components/Switch/PkTriSwitch";
import PkAttributeTextLabel from "components/Text/PkAttributeTextLabel";
import { Component } from "preact"
import * as css from "components/pk.module.css"
import PkAttributeViewerField from "components/Text/PkAttributeViewerField";

type PkSkillFieldProps = {
    prof_key: string,
    mod_key: string,
    label: string,
    run_header: string,
    label_run_header: string,
    disallow_expertise?: boolean
}

export default class PkSkillField extends Component<PkSkillFieldProps> {
    render() {
        const limit = this.props.disallow_expertise ? 1 : 2;
        return <div className={css.pkskillfield}>
            <PkTriSwitch my_key={this.props.prof_key} field_limit={limit} />
            <PkAttributeViewerField my_key={this.props.mod_key} modifier run_func="roll" run_header={this.props.run_header}/>
            <PkAttributeTextLabel label={this.props.label} attr_on_click={this.props.mod_key} runheader_on_click={this.props.label_run_header} />
            </div>
    }
}