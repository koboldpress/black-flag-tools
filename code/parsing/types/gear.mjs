import Parser from "../parser.mjs";

export default function parseGear(input) {
	const data = { type: "gear" };
	const parser = new Parser(input);

	// Name
	data.name = parser.consumeLine();

	// Type
	data["system.type.category"] = parser.consumeEnum(CONFIG.BlackFlag.gearCategories.localized, { extra: ", " });
	if ( !data["system.type.category"] ) {
		data["system.type.base"] = parser.consumeEnum(
			CONFIG.BlackFlag.gearCategories.clothing.children.localized, { extra: ", " }
		);
		if ( data["system.type.base"] ) data["system.type.category"] = "clothing";
	}

	// Rarity
	data["system.rarity"] = parser.consumeEnum(CONFIG.BlackFlag.rarities.localized);

	// Attunement
	const grabAttunement = () => {
		const attunement = parser.consumeRegex(/\s*\(Requires Attunement\s*(?<requirement>[^\)]+)?\)/i);
		if ( attunement ) {
			data["system.attunement.value"] = "required";
			if ( attunement.groups.requirement ) data["system.attunement.requirement"] = attunement.groups.requirement;
		}
	};
	grabAttunement();

	// Cost
	const cost = parser.consumeRegex(/\s*(?<price>[\d,]+) gp/i);
	if ( cost ) {
		const number = Number(cost.groups.price.replace(",", ""));
		if ( Number.isFinite(number) ) data["system.price.value"] = number;
	}
	grabAttunement();

	// Description
	data["system.description.value"] = parser.consumeDescription();

	return new Item.implementation(foundry.utils.expandObject(data));
}
