
import { Component } from "preact";
import * as css from "components/pk.module.css"
import PkAttributeTextLabel from "components/Text/PkAttributeTextLabel";
import PkAttributeViewerField from "components/Text/PkAttributeViewerField";

type PkAttributeViewerFieldProps = {
    my_key: string,
    label: string,
    modifier?: boolean,
    suffix?: string,
    run_func?: string
    run_header: string
}

export class PkAttributeViewerLineField extends Component<PkAttributeViewerFieldProps> {
    render() {
        return <div className={css.pkattrline}>
            <PkAttributeViewerField
                my_key={this.props.my_key}
                modifier={this.props.modifier}
                suffix={this.props.suffix}
                className={css.bignumber}
                run_func={this.props.run_func}
                run_header={this.props.run_header}/>
            <PkAttributeTextLabel label={this.props.label} attr_on_click={this.props.my_key} />
        </div>;
    }
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
            <PkAttributeTextLabel label={this.props.label} attr_on_click={this.props.my_key} />
        </div>;
    }
}