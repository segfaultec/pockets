import { Component } from "preact";
import { PkTextLabel } from "./PkTextLabel";
import { PkAttributeEditorField, PkAttributeViewerField } from "./PkAttributeField";
import { zip_classes } from "./PkFieldHelpers";

import * as css from "../pk.module.css";

type PkStatsBoxFieldProps = {
    base_key: string,
    mod_key: string,
    label: string
}

export class PkStatsBoxField extends Component<PkStatsBoxFieldProps> {
    render() {
        return <div className={css.pkstatsbox}>
            <PkTextLabel label={this.props.label} />
            <div>
            <PkAttributeViewerField 
                my_key={this.props.mod_key}
                className={css.bignumber}
                modifier
                run_func="roll"
                run_header={`${this.props.label} Check`}
                />
            </div>
            <PkAttributeEditorField
                my_key={this.props.base_key}/>
        </div>;
    }
}

type PkAttributeViewerFieldProps = {
    my_key: string,
    label: string,
    modifier?: boolean,
    suffix?: string,
    run_func?: string
    run_header: string
}

export class PkAttributeViewerBoxField extends Component<PkAttributeViewerFieldProps> {
    render() {
        return <div className={css.pkattrbox}>
            <PkAttributeViewerField
                my_key={this.props.my_key}
                modifier={this.props.modifier}
                suffix={this.props.suffix}
                className={css.bignumber}
                run_func={this.props.run_func}
                run_header={this.props.run_header}/>
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}

type PkHealthViewerFieldProps = {
    current_key: string,
    max_key: string,
    label: string
}

export class PkHealthViewerBoxField extends Component<PkHealthViewerFieldProps> {
    render() {
        return <div className={css.pkhealthbox}>
            <PkAttributeEditorField
                my_key={this.props.current_key} className={css.bignumber} always_edit number />
            <PkAttributeEditorField
                my_key={this.props.max_key} always_edit number/>
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}

type PkHitDiceBoxFieldProps = {
    current_key: string,
    max_key: string,
    size_key: string,
    label: string
}

export class PkHitDiceBoxField extends Component<PkHitDiceBoxFieldProps> {
    render() {
        return <div className={css.pkhitdicebox}>
            <div className={css.pkhitdicebox_inner}>
                <PkAttributeEditorField
                    my_key={this.props.current_key}
                    always_edit number />
                <button>/</button>
                <PkAttributeEditorField
                    my_key={this.props.max_key}/>
                <button>d</button>
                <PkAttributeEditorField
                    my_key={this.props.size_key} number />
            </div>
            
            <PkTextLabel label={this.props.label} />
        </div>;
    }
}