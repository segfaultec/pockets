
import { Component } from "preact"
import * as css from "./skillfield.module.css"
import { CS } from "components/App"
import { useContext } from "preact/hooks"
import PkSkillField from "./PkSkillField";
import PkTextLabel from "components/Text/PkTextLabel";

export default class PkSavesFieldContainer extends Component {
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