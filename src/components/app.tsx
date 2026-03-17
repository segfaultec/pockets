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
import { PkTab, PkTabs } from './PkTabs';

function createCharsheet(): Charsheet {
    let attributes = new UnparsedAttrContainer;

    let unparsed = [
        ["hp", "83"],
        ["max_hp", "87"],
        ["ac", "15"],
        ["initiative_mod", "[dex_mod]"],
        ["speed", "30"],
        ["level", "11"],
        ["hit_dice_count", "11"],
        ["hit_dice_size", "6"],

        ["gen_stat", "4d6d1"],
        ["roll", "d20"],
        ["pb", "3"],
        ["stat_mod", "([input]-10)//2"],

        ["str", "8"],
        ["str_mod", "[stat_mod([str])]"],
        ["str_check", "[roll]+[str_mod]"],
        ["dex", "15"],
        ["dex_mod", "[stat_mod([dex])]"],
        ["dex_check", "[roll]+[dex_mod]"],
        ["con", "18"],
        ["con_mod", "[stat_mod([con])]"],
        ["con_check", "[roll]+[con_mod]"],
        ["int", "9"],
        ["int_mod", "[stat_mod([int])]"],
        ["int_check", "[roll]+[int_mod]"],
        ["wis", "11"],
        ["wis_mod", "[stat_mod([wis])]"],
        ["wis_check", "[roll]+[wis_mod]"],
        ["cha", "20"],
        ["cha_mod", "[stat_mod([cha])]"],
        ["cha_check", "[roll]+[cha_mod]"],
    ];

    type Override = {
        key: string
        value: string
    }

    type Overrides = [string, Override[]][];

    let skills = new CharsheetSkillsBox("Skills");

    skills.AddSkill("acrobatics", "Acrobatics", "dex");
    skills.AddSkill("animal_handling", "Animal Handling", "wis");
    skills.AddSkill("arcana", "Arcana", "int", "1");
    skills.AddSkill("athletics", "Athletics", "str");
    skills.AddSkill("deception", "Deception", "cha");
    skills.AddSkill("endurance", "Endurance", "con");
    skills.AddSkill("history", "History", "int");
    skills.AddSkill("insight", "Insight", "wis", "2");
    skills.AddSkill("intimidation", "Intimidation", "cha");
    skills.AddSkill("investigation", "Investigation", "int");
    skills.AddSkill("medicine", "Medicine", "wis");
    skills.AddSkill("nature", "Nature", "int");
    skills.AddSkill("preception", "Perception", "wis");
    skills.AddSkill("performance", "Performance", "cha");
    skills.AddSkill("persuasion", "Persuasion", "cha", "2");
    skills.AddSkill("religion", "Religion", "int");
    skills.AddSkill("slight_of_hand", "Slight of Hand", "dex");
    skills.AddSkill("stealth", "Stealth", "dex");
    skills.AddSkill("streetwise", "Streetwise", "wis");
    skills.AddSkill("survival", "Survival", "wis");
    skills.AddSkill("technology", "Technology", "int", "1");
    
    let overrides: Overrides = [
        ["advantage", [{key: "attack_roll", value: "(2[input]kh1)"}]]
    ]

    for (const kvp of unparsed) {
        attributes.add_attribute(kvp[0], kvp[1]);
    }

    let text_fields = new TextFieldContainer;
    text_fields.set("name", "Mixolydian");
    text_fields.set("class", "Sorcerer 11");
    text_fields.set("race", "Reborn")
    text_fields.set("background", "Hermit");
    text_fields.set("size", "Medium");
    text_fields.set("alignment", "Lawful Good");

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