import GrantFeaturesConversion from "./grant-features.mjs";

export default class GrantSpellsConversion extends GrantFeaturesConversion {
	static advancementType = "grantSpells";

	static paths = [
		...super.paths,
		["configuration.spell", "configuration.spell", GrantSpellsConversion.convertSpellConfiguration]
	];
}
