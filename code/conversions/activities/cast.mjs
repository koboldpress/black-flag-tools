import { convertAbility } from "../configs/abilities.mjs";
import BaseActivityConversion from "./base.mjs";

export default class CastActivityConversion extends BaseActivityConversion {
	static activityType = "cast";

	static paths = [
		...super.paths,
		[null, "system.spell.ability", convertAbility],
		["spell.challenge.attack", "system.spell.challenge.attack"],
		["spell.challenge.save", "system.spell.challenge.save"],
		["spell.challenge.override", "system.spell.challenge.override"],
		["spell.level", "system.spell.circle"],
		["spell.properties", "system.spell.properties", initial => initial.map(i => (i === "vocal" ? "verbal" : i))],
		["spell.spellbook", "system.spell.spellbook"],
		["spell.uuid", "system.spell.uuid"]
	];
}
