import ChooseFeaturesConversion from "./choose-features.mjs";

export default class ChooseSpellsConversion extends ChooseFeaturesConversion {

	static advancementType = "chooseSpells";

	static paths = [
		...super.paths,
		["configuration.spell",             "configuration.spell",        ChooseSpellsConversion.convertSpellConfiguration],
		["configuration.restriction.level", "configuration.restriction.circle", ChooseSpellsConversion.convertCircle      ],
	];

	static convertCircle(initial) {
		if ( initial === "available" ) return -1;
		return Number.parseInt(initial);
	}

}
