import { CS } from "components/app";
import { CharsheetApp } from "components/charsheet_app";
import PkRadioSwitcher from "./PkRadioSwitcher";

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

        return <PkRadioSwitcher
            options={options}
            option_displays={options_display}
            selected_option={current_option}
            onChange={(new_option) => this.setOption(sheet, new_option)} 
            />
    }
}