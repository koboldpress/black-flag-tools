import Parser from "../parser.mjs";

export default function parseGear(input) {
	const data = { type: "gear" };
	const parser = new Parser(input);

	data.name = parser.consumeLine();
	data["system.type.category"] = parser.consumeEnum(CONFIG.BlackFlag.gearCategories.localized, { extra: ", " });
	data["system.rarity"] = parser.consumeEnum(CONFIG.BlackFlag.rarities.localized);
	const cost = parser.consumeRegex(/\s*(?<price>[\d,]+) gp/i);
	if ( cost ) {
		const number = Number(cost.groups.price.replace(",", ""));
		if ( Number.isFinite(number) ) data["system.price.value"] = number;
	}
	data["system.description.value"] = parser.consumeDescription();

	return new Item.implementation(foundry.utils.expandObject(data));
}
