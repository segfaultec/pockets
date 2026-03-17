import { Component } from "preact";
import { useContext } from "preact/hooks";
import { CS } from "./app";
import PkCheckbox from "./PkCheckbox";

export default class PkEditModeToggle extends Component {
    render() {
        const { sheet } = useContext(CS);

        return <PkCheckbox
            label="Edit Mode"
            signal={sheet.edit_mode}
            />
    }
}