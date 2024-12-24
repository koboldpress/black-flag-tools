import { getProperty, setProperty } from "../../../utils.mjs";
import BaseConversion from "../../base.mjs";
import { convertAbility } from "../../configs/abilities.mjs";

export default class InitiativeConversion extends BaseConversion {

	static paths = [
		["system.attributes.init.ability", "system.attributes.initiative.ability", convertAbility],
	];

	static postSteps = [
		InitiativeConversion.convertInitiativeModifiers
	];

	static convertInitiativeModifiers(initial, final, context) {
		const init = getProperty(initial, "system.attributes.init");
		const modifiers = getProperty(final, "system.modifiers") ?? [];

		if ( !init && context.delta ) return;

		if ( init.bonus && init.bonus !== "0" ) modifiers.push({
			type: "bonus",
			filter: [{ k: "type", v: "initiative" }],
			formula: init.bonus
		});

		if ( init.roll?.min && init.roll.min !== "0" ) modifiers.push({
			type: "min",
			filter: [{ k: "type", v: "initiative" }],
			formula: init.roll.min
		});

		if ( init.roll?.mode && init.roll.mode !== "0" )  modifiers.push({
			type: "note",
			filter: [{ k: "type", v: "initiative" }],
			note: {
				rollMode: init.roll.mode,
				text: `You have ${init.roll.mode === 1 ? "advantage" : "disadvantage"} on intiative.`
			}
		});

		setProperty(final, "system.modifiers", modifiers);
	}

}
