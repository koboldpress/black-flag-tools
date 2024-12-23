import BaseConversion from "../../base.mjs";

export default class ACConversion extends BaseConversion {

	static paths = [
		["system.attributes.ac", "system.attributes.ac", ACConversion.convertAC]
	];

	static FORMULAS = {
		mage: {
			label: "Mage Armor",
			formula: "13 + @abilities.dexterity.mod"
		},
		draconic: {
			label: "Draconic Resilience",
			formula: "13 + @abilities.dexterity.mod",
			armored: false
		},
		unarmoredMonk: {
			label: "Unarmored Defense",
			formula: "10 + @abilities.dexterity.mod + @abilities.wisdom.mod",
			armored: false,
			shielded: false
		},
		unarmoedBarb: {
			label: "Unarmoed Defense",
			formula: "10 + @abilities.dexterity.mod + @abilities.constitution.mod",
			armored: false
		}
	};

	static convertAC(initial) {
		const final = {};

		// If flat AC is set, set override
		if ( initial.calc === "flat" ) {
			final.override = initial.flat;
		}

		// If natural calculation is used, set flat
		else if ( initial.calc === "natural" ) {
			final.baseFormulas = ["natural"];
			final.flat = initial.flat;
		}

		// Copy of a custom formula
		else if ( initial.calc === "custom" ) {
			final.formulas = [{
				label: "Custom",
				formula: ac.formula
			}];
		}

		// If a non-default formula is used, add a custom formula to match
		else if ( initial.calc in ACConversion.FORMULAS ) {
			final.formulas = [ACConversion.FORMULAS[initial.calc]];
		}

		return final;
	}

}
