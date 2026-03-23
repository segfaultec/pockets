import { Component } from "preact"
import { PkTriSwitch } from "./PkSwitch"
import { PkAttributeViewerField } from "./PkAttributeField"
import { PkAttributeTextLabel, PkTextLabel } from "./PkTextLabel"
import * as css from "../pk.module.css"
import { CS } from "components/app"
import { useContext } from "preact/hooks"

type PkSkillFieldProps = {
    prof_key: string,
    mod_key: string,
    label: string
}

export default class PkSkillField extends Component<PkSkillFieldProps> {
    render() {
        return <div className={css.pkskillfield}>
            <PkTriSwitch my_key={this.props.prof_key} />
            <PkAttributeViewerField my_key={this.props.mod_key} modifier run_func="roll_adv" run_header={`${this.props.label} Check`}/>
            <PkAttributeTextLabel label={this.props.label} attr_on_click={this.props.mod_key} />
            </div>
    }
}

type PkSkillFieldContainerProps = {}

export class PkSkillFieldContainer extends Component<PkSkillFieldContainerProps> {
    render() {
        let { sheet } = useContext(CS);

        let elems = [];

        for (const skill of sheet.skills.skills) {
            elems.push(<PkSkillField
                prof_key={skill.key_prof}
                mod_key={skill.key_mod}
                label={skill.label}/>);
        }

        return <div className={css.pkskillsfieldcontainer}>
            <PkTextLabel label={sheet.skills.title} />
            {elems}
        </div>
    }
}