import { Signal } from "@preact/signals";
import { Component, createRef } from "preact"

import * as css from "./pkcheckbox.module.css";


type PkCheckboxProps = {
    label: string,
    signal: Signal<boolean>
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

        return <div className={css.pkcheckbox}>
            {label}
            {checkbox}
        </div>
        
    }
}