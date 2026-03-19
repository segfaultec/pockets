var obj:any = {};
obj = window;

import 'preact/debug'

import { render, createContext, Context, Component } from 'preact';
import { AttrContainer, UnparsedAttrContainer } from 'lib/attribute';
import { Charsheet, CharsheetSkillsBox } from 'lib/charsheet';

import AttributeMenu from './AttributeMenu';
import EvalContainer from "./eval/EvalContainer";

import PkEditModeToggle from './PkEditModeToggle';
import { TextFieldContainer } from 'lib/TextFieldContainer';
import { CharsheetApp } from './charsheet_app';
import PkLayout from './text/PkLayout';

import * as css from "./pk.module.css";
import Chat from './chat/Chat';
import { PkTab, PkTabs } from './library/PkTabs';

import data from "./charsheet_data.json"

function createCharsheet(): Charsheet {
    let attributes = new UnparsedAttrContainer;

    type Override = {
        key: string
        value: string
    }

    type Overrides = [string, Override[]][];

    let skills = new CharsheetSkillsBox("Skills");
    for (const skill of data.skills) {        
        skills.ImportSkillFromJson(skill);
    }

    let overrides: Overrides = [];
    for (const override of data.overrides) {
        overrides.push([override[0], [{key: override[1], value: override[2]}]]);
    }

    for (const kvp of data.attributes) {
        attributes.add_attribute(kvp[0], kvp[1]);
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

class App extends Component<{}, {}> {

    constructor() {
        super();
    }

    render() {
    
        const sheet = new CharsheetApp(createCharsheet());

        return (
            <CS.Provider value={{sheet}}>
            <div id={css.main}>
                <div id={css.main_sheet}>
                    <PkTabs>
                        <PkTab title='Layout'>
                            <PkEditModeToggle />
                            <PkLayout />
                        </PkTab>
                        <PkTab title='Attributes'>
                            <EvalContainer eval_result={sheet.last_ran_expr} show_tree={false}/>
                            <AttributeMenu attributes={sheet.attributes} />
                        </PkTab>
                    </PkTabs>
                </div>
               
                <div id={css.main_chat}>
                    <Chat />
                </div>
            </div>
            
            </CS.Provider>
        );
    }

}

render(<App />, document.body);