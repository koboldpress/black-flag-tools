import { getProperty, setProperty } from "../utils.mjs";
import { selectConverter } from "./_module.mjs";
import BaseConversion from "./base.mjs";
import { convertAbility } from "./configs/abilities.mjs";
import { convertCreatureType, convertSize } from "./configs/actors.mjs";
import ACConversion from "./templates/ac-conversion.mjs";
import InitiativeConversion from "./templates/initiative-conversion.mjs";
import LanguagesConversion from "./templates/languages-conversion.mjs";
import TraitsConversion from "./templates/traits-conversion.mjs";

export default class NPCConversion extends BaseConversion {

	static preSteps = [
		NPCConversion.convertAbilities,
	];

	static templates = [
		ACConversion,
		InitiativeConversion,
		LanguagesConversion,
		TraitsConversion,
	];

	static paths = [
		["system.attributes.exhaustion",   "system.attributes.exhaustion"                                      ],
		["system.details.cr",              "system.attributes.cr"                                              ],
		["system.attributes.hp.max",       "system.attributes.hp.max"                                          ],
		["system.attributes.hp.temp",      "system.attributes.hp.temp"                                         ],
		["system.attributes.hp.value",     "system.attributes.hp.value"                                        ],
		["system.resources.legact.max",    "system.attributes.legendary.max"                                   ],
		["system.details.biography.value", "system.biography.value"                                            ],
		["system.details.source.book",     "system.biography.source.book"                                      ],
		["system.details.source.custom",   "system.biography.source.fallback"                                  ],
		["system.details.source.page",     "system.biography.source.page"                                      ],
		["system.attributes.spellcasting", "system.spellcasting.ability",     convertAbility                   ],
		["system.details.type",            "system.traits.type",              NPCConversion.convertCreatureType],
	];

	static postSteps = [
		NPCConversion.convertBonuses,
		NPCConversion.convertSkills,
	];

	static getProficiency(cr) {
		return Math.floor(((cr ?? 0) + 7) / 4);
	}

	static convertAbilities(initial, final) {
		const abilities = getProperty(initial, "system.abilities") ?? {};
		const proficiency = NPCConversion.getProficiency(getProperty(initial, "system.details.cr"));
		const modifiers = getProperty(final, "system.modifiers") ?? [];

		for ( const [key, data] of Object.entries(abilities) ) {
			let mod = Math.floor((data.value - 10) / 2);
			const proficient = data.proficient === 1;
			if ( proficient ) mod += proficiency;
			setProperty(final, `system.abilities.${convertAbility(key)}`, { mod, proficient });

			if ( data.bonuses?.check && data.bonuses.check !== "0" ) modifiers.push({
				type: "bonus",
				filter: [{ k: "type", v: "ability-check" }, { k: "ability", v: convertAbility(key) }],
				formula: data.bonuses.check
			});

			if ( data.bonuses?.save && data.bonuses.save !== "0" ) modifiers.push({
				type: "bonus",
				filter: [{ k: "type", v: "ability-save" }, { k: "ability", v: convertAbility(key) }],
				formula: data.bonuses.save
			});
		}

		setProperty(final, "system.modifiers", modifiers);
	}

	static convertBase(initial) {
		const final = super.convertBase(initial);

		final.items = [];
		for ( const data of initial.items ?? [] ) {
			const Converter = selectConverter(data);
			final.items.push(Converter.convert(data));
		}

		return final;
	}

	static convertBonuses(initial, final) {
		const bonuses = getProperty(initial, "system.bonuses") ?? {};
		const modifiers = getProperty(final, "system.modifiers") ?? [];

		const attacks = [
			["mwak", "melee", "weapon"], ["rwak", "ranged", "weapon"],
			["msak", "melee", "spell"],  ["rsak", "ranged", "spell"]
		];
		for ( const [key, type, classification] of attacks ) {
			for ( const kind of ["attack", "damage"] ) {
				if ( bonuses[key]?.[kind] && bonuses[key][kind] !== "0" ) modifiers.push({
					type: "bonus",
					filter: [
						{ k: "type", v: "attack" },
						{ k: "kind", v: kind },
						{ k: "activity.type.value", v: type },
						{ k: "activity.type.classification", v: classification }
					 ],
					formula: bonuses[key][kind]
				});
			}
		}

		if ( bonuses.abilities?.check && bonuses.abilities.check !== "0" ) modifiers.push({
			type: "bonus",
			filter: [{ k: "type", v: "ability-check" }],
			formula: bonuses.abilities.check
		});
	
		if ( bonuses.abilities?.save && bonuses.abilities.save !== "0" ) modifiers.push({
			type: "bonus",
			filter: [{ k: "type", v: "ability-save" }],
			formula: bonuses.abilities.save
		});

		// TODO: If spell DC bonus is set, calculate spell bonus and add

		setProperty(final, "system.modifiers", modifiers);
	}

	static convertCreatureType(initial) {
		const final = {
			custom: [],
			tags: [],
			value: convertCreatureType(initial.value)
		};
		if ( initial.custom ) final.custom.push(initial.custom);
		if ( initial.swarm ) final.swarm = convertSize(initial.swarm);

		for ( let subtype of initial.subtype?.split(",") ) {
			subtype = subtype.trim();
			if ( !subtype ) continue;
			if ( subtype.toLowerCase() === "any race" ) {
				if ( !final.tags.includes("anyLineage") ) final.tags.push("anyLineage");
				continue;
			} else if ( subtype.toLowerCase() === "shapechanger" ) {
				if ( !final.tags.includes("shapechanger") ) final.tags.push("shapechanger");
				continue;
			}
			final.custom.push(subtype);
		}

		return final;
	}

	static convertSkills(initial, final) {
		const proficiency = NPCConversion.getProficiency(getProperty(initial, "system.details.cr"));
		const skills = [["prc", "perception", "wisdom"], ["ste", "stealth", "dexterity"]];
		for ( const [short, long, ability] of skills ) {
			const data = getProperty(initial, `system.skills.${short}`) ?? {};
			const mod = getProperty(final, `system.abilities.${ability}.mod`) ?? 0;
			if ( data.value === 0 ) continue;
			const score = 10 + Math.floor(proficiency * data.value) + mod;
			setProperty(final, `system.attributes.${long}`, score);
		}
	}

}