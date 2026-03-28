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

export class PkSkillFieldContainer extends Component {
    render() {
        let { sheet } = useContext(CS);

        let elems = [];

        for (const skill of sheet.skills.skills) {
            elems.push(<PkSkillField
                prof_key={skill.key_prof}
                mod_key={skill.key_mod}
                label={skill.label}
                run_header={`${skill.label} Check`}
                label_run_header={skill.label}/>);
        }

        return <div className={css.pkskillsfieldcontainer}>
            <PkTextLabel label="Skills" />
            {elems}
        </div>
    }
}

export class PkSavesFieldContainer extends Component {
    render() {
        let { sheet } = useContext(CS);

        let elems = [];

        for (const save of sheet.skills.saves) {
            elems.push(<PkSkillField
                prof_key={save.key_prof}
                mod_key={save.key_mod}
                label={save.label}
                run_header={`${save.label} Saving Throw`}
                label_run_header={`${save.label} Saving Throw Modifier`}
                disallow_expertise/>);
        }

        return <div className={css.pkskillsfieldcontainer}>
            <PkTextLabel label="Saves" />
            {elems}
        </div>
    }
}