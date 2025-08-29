import BaseConversion from "../../base.mjs";
import { convertDistanceUnit } from "../../configs/units.mjs";

export default class SensesConversion extends BaseConversion {

	static paths = [
		["system.attributes.senses", "system.traits.senses", SensesConversion.convertSenses],
	];

	static convertSenses(initial, context) {
		const final = {
			custom: [],
			tags: [],
			types: {},
			unit: convertDistanceUnit(initial.unit) ?? "foot"
		};

		for ( let type of ["darkvision", "blindsight", "tremorsense", "truesight"] ) {
			if ( initial[type] ) final.types[type === "blindsight" ? "keensense" : type] = initial[type];
		}

		for ( let entry of initial.special?.split(";") ?? [] ) {
			entry = entry.trim();
			if ( !entry ) continue;
			if ( entry.toLowerCase().includes("blind beyond") ) {
				if ( !final.tags.includes("cantSense") ) final.tags.push("cantSense");
				continue;
			}
			final.custom.push(entry);
		}

		return final;
	}

}
