
import { LabelContainer } from "./label";
import {AttrContainer, UnparsedAttrContainer} from "./attribute";
import { TextFieldContainer } from "./textfield";

type CharsheetSkillsBoxEntry = {
    key_prof: string,
    key_mod: string,
    ability: string,
    label: string,
    starting_proficiency: string
}

type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
type Proficiency = "0" | "1" | "2";

export class CharsheetSkillsBox {
    public skills: CharsheetSkillsBoxEntry[] = [];
    public saves: CharsheetSkillsBoxEntry[] = [];

    constructor() {
    }

    AddSkill(prefix: string, label: string, ability: Ability, value: Proficiency = "0") {
        this.skills.push({
            key_prof: prefix + "_prof",
            key_mod: prefix + "_mod",
            ability,
            label,
            starting_proficiency: value
        })
    }

    AddSave(label: string, ability: Ability, value: Proficiency = "0") {
        this.saves.push({
            key_prof: ability + "_save_prof",
            key_mod: ability + "_save_mod",
            ability,
            label,
            starting_proficiency: value
        })
    }

    ImportSkillFromJson(skill: string[]) {
        this.AddSkill(skill[0], skill[1], skill[2] as Ability, skill[3] as Proficiency | undefined);
    }

    ImportSaveFromJson(save: string[]) {
        this.AddSave(save[0], save[1] as Ability, save[2] as Proficiency | undefined);
    }
}

export class Charsheet {
    public attributes: AttrContainer;
    public labels: LabelContainer;
    public skills: CharsheetSkillsBox;
    public text_fields: TextFieldContainer;

    constructor(attributes: AttrContainer, labels: LabelContainer, skills: CharsheetSkillsBox, text_fields: TextFieldContainer) {
        this.attributes = attributes;
        this.labels = labels;
        this.skills = skills;
        this.text_fields = text_fields;

        for (const skill of skills.skills) {
            const attrs = this.attributes.get_unparsed(true);
            attrs.add_attribute(skill.key_prof, skill.starting_proficiency);
            attrs.add_attribute(skill.key_mod, `[${skill.ability}_mod]+[${skill.key_prof}]*[pb]`)
        }

        for (const save of skills.saves) {
            const attrs = this.attributes.get_unparsed(true);
            attrs.add_attribute(save.key_prof, save.starting_proficiency);
            attrs.add_attribute(save.key_mod, `[${save.ability}_mod]+[${save.key_prof}]*[pb]`);
        }
    }
}