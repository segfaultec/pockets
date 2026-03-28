import { Component } from "preact";

import * as css from "./pkradioswitcher.module.css"
import { ClsCombine } from "components/utils/ClassHelpers";

type PkRadioSwitcherProps = {
    options: any[]
    option_displays?: string[],
    selected_option: any,
    className?: string,
    onChange?: (newSelected: string) => void
}

export default class PkRadioSwitcher extends Component<PkRadioSwitcherProps> {

    render() {
        const option_displays = this.props.option_displays !== undefined ? this.props.option_displays : this.props.options;

        return <div role="radiogroup" className={ClsCombine(css.pkradioswitcher, this.props.className)}>
            {
                this.props.options.map((option, index) => {
                    return <button role="radio" tabIndex={index} aria-checked={option === this.props.selected_option}
                        onClick={() => { this.props.onChange?.(option); }}>
                        {option_displays[index]}
                    </button>
                })
            }
        </div>
    }
}