
import { Component } from "preact"
import * as css from "./skillfield.module.css"
import { CS } from "components/App"
import { useContext } from "preact/hooks"
import PkSkillField from "./PkSkillField";
import PkTextLabel from "components/Text/PkTextLabel";

export default class PkSkillFieldContainer extends Component {
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
