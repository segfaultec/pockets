import { Signal } from "@preact/signals";
import { Component } from "preact"

import * as css from "./pkcheckbox.module.css";
import { ClsCombine } from "components/utils/ClassHelpers";


type PkCheckboxProps = {
    label: string,
    signal: Signal<boolean>,
    className?: string
}

export default class PkCheckbox extends Component<PkCheckboxProps> {

    render() {

        // todo label for=?
        const label = <label>
            {this.props.label}
            </label>;

        const checkbox = <input 
                type="checkbox"
                checked={this.props.signal.value}
                onClick={() => {
                    this.props.signal.value = !this.props.signal.value
                }}
            />

        return <div className={ClsCombine(css.pkcheckbox, this.props.className)}>
            {label}
            {checkbox}
        </div>
        
    }
}