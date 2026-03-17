import { Component } from "preact";
import { useContext } from "preact/hooks";
import { CS } from "./app";
import PkCheckbox from "./library/PkCheckbox";

import * as css from "./pkeditmodetoggle.module.css"

export default class PkEditModeToggle extends Component {
    render() {
        const { sheet } = useContext(CS);

        return <PkCheckbox
            label="Edit Mode"
            signal={sheet.edit_mode}
            className={css.pkeditmodetoggle}
            />
    }
}