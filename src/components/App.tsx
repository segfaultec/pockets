import 'preact/debug'

import { render, createContext, Context, Component } from 'preact';
import { AttrContainer, UnparsedAttrContainer } from 'lib/attribute';
import { Charsheet, CharsheetSkillsBox } from 'lib/charsheet';

import AttributeMenu from './AttributeMenu/AttributeMenu';

import { LabelContainer } from 'lib/label';
import { CharsheetApp } from './charsheet_app';
import PkLayout from './PkLayout';

import * as css from "./pk.module.css";
import Chat from './Chat/Chat';
import { PkTab, PkTabs } from './Tabs/PkTabs';

import data from "./charsheet_data.json"
import PkCheckbox from './Checkbox/PkCheckbox';
import PkRollOptionsSwitcher from './RadioSwitcher/PkRollOptionsSwitcher';

function createCharsheet(): Charsheet {
    let attributes = new UnparsedAttrContainer;

    let skills = new CharsheetSkillsBox();
    for (const skill of data.skills) {        
        skills.ImportSkillFromJson(skill);
    }

    for (const save of data.saves) {
        skills.ImportSaveFromJson(save);
    }

    for (const kvp of data.attributes) {
        attributes.add_attribute(kvp[0], kvp[1]);
    }

    for (const kvp of data.overrides) {
        attributes.add_override(kvp[0], kvp[1], kvp[2]);
    }

    let labels = new LabelContainer;
    for (const text_field of data.text_fields) {
        labels.set(text_field[0], text_field[1]);
    }

    return new Charsheet(new AttrContainer(attributes), labels, skills);
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
                            <PkRollOptionsSwitcher />
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