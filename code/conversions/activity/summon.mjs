import { convertCreatureType, convertSize } from "../configs/actors.mjs";
import BaseActivityConversion from "./base.mjs";

export default class SummonActivityConversion extends BaseActivityConversion {
	static activityType = "summon";

	static paths = [
		...super.paths,
		["bonuses.ac", "system.bonuses.ac"],
		["bonuses.hd", null],
		["bonuses.hp", "system.bonuses.hp"],
		["bonuses.attackDamage", "system.bonuses.attackDamage"],
		["bonuses.saveDamage", "system.bonuses.saveDamage"],
		["bonuses.healing", "system.bonuses.healing"],
		["creatureSizes", "system.creatureSizes", initial => initial.map(i => convertSize(i))],
		["creatureTypes", "system.creatureTypes", initial => initial.map(i => convertCreatureType(i))],
		["effects", "system.effects"],
		["match.ability", null],
		["match.attacks", "system.match.attacks"],
		["match.proficiency", "system.match.proficiency"],
		["match.saves", "system.match.saves"],
		["profiles", "system.profiles", initial => initial.map(i => this.convertProfile(i))],
		["summon.identifier", "system.summon.identifier"],
		["summon.mode", "system.summon.mode"],
		["summon.prompt", "system.summon.prompt"]
	];

	static convertProfile(initial) {
		return { ...initial, types: initial.types?.map(t => convertCreatureType(t)) };
	}
}
