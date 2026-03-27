import 'preact/debug'

import { render, createContext, Context, Component } from 'preact';
import { AttrContainer, UnparsedAttrContainer } from 'lib/attribute';
import { Charsheet, CharsheetSkillsBox } from 'lib/charsheet';

import AttributeMenu from './AttributeMenu';
import EvalContainer from "./eval/EvalContainer";

import { TextFieldContainer } from 'lib/TextFieldContainer';
import { CharsheetApp } from './charsheet_app';
import PkLayout from './text/PkLayout';

import * as css from "./pk.module.css";
import Chat from './chat/Chat';
import { PkTab, PkTabs } from './library/PkTabs';

import data from "./charsheet_data.json"
import PkCheckbox from './library/PkCheckbox';
import PkRadioSwitcher from './library/PkRadioSwitcher';

function createCharsheet(): Charsheet {
    let attributes = new UnparsedAttrContainer;

    let skills = new CharsheetSkillsBox("Skills");
    for (const skill of data.skills) {        
        skills.ImportSkillFromJson(skill);
    }

    for (const kvp of data.attributes) {
        attributes.add_attribute(kvp[0], kvp[1]);
    }

    for (const kvp of data.overrides) {
        attributes.add_override(kvp[0], kvp[1], kvp[2]);
    }

    let text_fields = new TextFieldContainer;
    for (const text_field of data.text_fields) {
        text_fields.set(text_field[0], text_field[1]);
    }

    return new Charsheet(new AttrContainer(attributes), text_fields, skills);
}

export type CharsheetContext = {
    sheet: CharsheetApp,
}

export let CS: Context<CharsheetContext> = createContext({} as CharsheetContext);

type AppState = {
    sheet: CharsheetApp
}

class App extends Component<{}, AppState> {

    constructor() {
        super();
    }

    componentWillMount(): void {
        this.setState({sheet: new CharsheetApp(createCharsheet())})
    }

    render() {

        const sheet = this.state.sheet;

        // Todo move so this doesn't rerender the whole sheet when updated
        let roll_options = ["Normal", "Advantage", "Disadvantage"];
        const roll_override = sheet.attributes.get_inner().get_override("roll");
        let selected_option = "???";
        switch (roll_override) {
            case "advantage":
                selected_option = "Advantage";
                break;
            case "disadvantage":
                selected_option = "Disadvantage";
                break;
            case null:
                selected_option = "Normal";
                break;
        }

        const onRollOptionClicked = (new_option: string) => {
            let new_override: string | null = null;
            switch (new_option) {
                case "Normal":
                    new_override = null;
                    break;
                case "Advantage":
                    new_override = "advantage"
                    break;
                case "Disadvantage":
                    new_override = "disadvantage"
                    break;
            }
            sheet.attributes.mutate((attrs) => {
                attrs.set_override("roll", new_override)
            })
        }

        return <CS.Provider value={{sheet}}>
        <div id={css.main}>
            <div id={css.main_sheet}>
                <PkTabs>
                    <PkTab title='Layout'>
                        <span className={css.pkcharsheet_checkboxes_container}>
                            <PkCheckbox
                                label="Edit Mode"
                                signal={sheet.edit_mode}
                                className={css.pkeditmodetoggle}
                                />
                            <PkCheckbox
                                label="Advanced Display"
                                signal={sheet.advanced_display}
                                className={css.pkeditmodetoggle}
                                />
                            <PkRadioSwitcher options={roll_options}
                                selected_option={selected_option}
                                onChange={onRollOptionClicked}
                                />
                        </span>
                        <PkLayout />
                    </PkTab>
                    <PkTab title='Attributes'>
                        <AttributeMenu attributes={sheet.attributes} />
                    </PkTab>
                </PkTabs>
            </div>
            
            <div id={css.main_chat}>
                <Chat />
            </div>
        </div>
        
        </CS.Provider>
    }

}

render(<App />, document.body);