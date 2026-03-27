import { Component } from "preact";

import * as css from "./pkradioswitcher.module.css"
import { ClsCombine } from "components/utils/ClassHelpers";

type PkRadioSwitcherProps = {
    options: string[]
    selected_option: string,
    className?: string,
    onChange?: (newSelected: string) => void
}

export default class PkRadioSwitcher extends Component<PkRadioSwitcherProps> {

    render() {
        return <div role="radiogroup" className={ClsCombine(css.pkradioswitcher, this.props.className)}>
            {
                this.props.options.map((option, index) => (
                    <button role="radio" tabIndex={index} aria-checked={option === this.props.selected_option}
                        onClick={() => { this.props.onChange?.(option); }}>
                        {option}
                    </button>
                ))
            }
        </div>
    }
}