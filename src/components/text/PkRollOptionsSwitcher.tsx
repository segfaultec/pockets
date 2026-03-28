import { CS } from "components/app";
import { CharsheetApp } from "components/charsheet_app";
import { pkradioswitcher } from "components/library/pkradioswitcher.module.css";

import { ClsCombine } from "components/utils/ClassHelpers";
import { Component } from "preact";
import { useContext } from "preact/hooks";

export default class PkRollOptionsSwitcher extends Component {

    setOption(sheet: CharsheetApp, new_option: string | null) {
        sheet.attributes.mutate((attrs) => {
            attrs.set_override("roll", new_option)
        })
    }

    render() {

        const options = [null, "advantage", "disadvantage"];
        const options_display = ["Normal", "Advantage", "Disadvantage"];

        let {sheet} = useContext(CS);

        const current_option = sheet.attributes.get_inner().get_override("roll");

        return <div role="radiogroup" className={ClsCombine(pkradioswitcher)}>
            {
                options.map((option, index) => {
                    const option_display = options_display[index];
                    return <button role="radio" tabIndex={index} aria-checked={option === current_option}
                        onClick={() => this.setOption(sheet, option)}>
                        {option_display}
                    </button>
                })
            }
        </div>
    }
}