import { TextField, TextFieldToken } from "lib/textfield";
import { Component } from "preact";
import PkTextLabel from "./PkTextLabel";
import { useContext } from "preact/hooks";
import { CS } from "components/App";
import * as css from "./text.module.css";
import { ClsCombine } from "components/utils/ClassHelpers";

type PkTextFieldTokenProps = {
    token: TextFieldToken;
}

class PkTextFieldToken extends Component<PkTextFieldTokenProps> {
    render() {
        if (this.props.token.is_expr) {
            return <span className={ClsCombine(css.token, css.expr)}>
                [{this.props.token.value}]
            </span>
        } else {
            return <span className={css.token}>
                {this.props.token.value}
            </span>
        }
    }
}

type PkTextFieldProps = {
    text_field: TextField;
}

class PkTextField extends Component<PkTextFieldProps> {
    render() {
        return <div className={css.textfield}>
            <p className={css.title}>{this.props.text_field.title}</p>
            { this.props.text_field.contents.map(t => <PkTextFieldToken token={t}/>) }
        </div>
    }
}

type PkTextFieldCategoryProps = {
    category: string,
    label: string
}

export default class PkTextFieldCategory extends Component<PkTextFieldCategoryProps> {
    render() {

        let { sheet } = useContext(CS);

        const category = sheet.text_fields.get_inner().get(this.props.category);
        const fields = category !== undefined
            ? category.map((f) => <PkTextField text_field={f} />) : [];

        return <div className={css.textfieldcategory}>
            <PkTextLabel {...this.props} centered className={css.label}/>
            {fields}
        </div>
    }
}