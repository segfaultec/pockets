import { Component } from "preact";
import { PkHeadingTextField } from "./PkTextField";

import * as css from "../pk.module.css";
import { PkAttributeViewerBoxField, PkHealthViewerBoxField, PkHitDiceBoxField, PkStatsBoxField } from "./PkBoxFields";
import { PkSkillFieldContainer } from "./PkSkillField";

export default class PkLayout extends Component {
    render() {
        return <div>

            <div className={css.flex}>
                <PkHeadingTextField className={css.character_name} my_key="name" label="Character Name" />

                <div className={css.flexchild_grow}>
                    <div className={css.flex}>
                        <PkHeadingTextField className={css.flexchild_grow} my_key="class" label="Class & Level" />
                        <PkHeadingTextField my_key="background" label="Background" />
                    </div>

                    <div className={css.flex}>
                        <PkHeadingTextField className={css.flexchild_grow} my_key="race" label="Race" />
                        <PkHeadingTextField my_key="size" label="Size" />
                        <PkHeadingTextField className={css.flexchild_grow} my_key="alignment" label="Alignment" />
                    </div>
                </div>
            </div>

            <hr />

            <div className={css.flex}>
                <div id="col1-stats" className={css.flexchild_shrink}>
                    <PkStatsBoxField base_key="str" mod_key="str_mod" label="Strength" />
                    <PkStatsBoxField base_key="dex" mod_key="dex_mod" label="Dexterity" />
                    <PkStatsBoxField base_key="con" mod_key="con_mod" label="Constitution" />
                    <PkStatsBoxField base_key="int" mod_key="int_mod" label="Intelligence" />
                    <PkStatsBoxField base_key="wis" mod_key="wis_mod" label="Wisdom" />
                    <PkStatsBoxField base_key="cha" mod_key="cha_mod" label="Charisma" />
                </div>
                <div id="col2-skills">
                    <PkSkillFieldContainer/>
                </div>
                <div id="col3-attacks" className={css.flexchild_grow}>
                    <div className={css.pkattrbox_container}>
                    <div className={css.flex}>
                    <PkAttributeViewerBoxField my_key="ac" label={"Armour\nClass"} run_header="Armour Class"/>
                    <PkAttributeViewerBoxField my_key="initiative_mod" label="Initiative" modifier run_func="roll_adv" run_header="Initiative Check"/>
                    <PkAttributeViewerBoxField my_key="speed" label="Speed" suffix="ft" run_header="Speed" />
                    </div>
                    <div className={css.flex}>
                    <PkHealthViewerBoxField current_key="hp" max_key="max_hp" label="HP" />
                    <PkHitDiceBoxField
                        current_key="hit_dice_count"
                        max_key="level"
                        size_key="hit_dice_size"
                        label="Hit Dice" />
                    </div>
                    </div>
                    
                </div>
                <div id="col4-feats">

                </div>
            </div>
        </div>
    }
}