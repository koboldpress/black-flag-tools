import Parser from "../parser.mjs";

export default async function parseMagicItem(type, input) {
	let data = { type };
	const parser = new Parser(input);

	// Name
	data.name = parser.consumeLine();

	// Type
	if (type === "consumable") findType(CONFIG.BlackFlag.consumableCategories, parser, data);
	else if (type === "rod") {
		parser.consumeUntil("Rod, ");
		const item = await fromUuid(CONFIG.BlackFlag.weapons.simple.children.club.link);
		data = { ...foundry.utils.flattenObject(item.toObject()), ...data };
		data.type = "weapon";
	} else if (type === "staff") {
		parser.consumeUntil("Staff, ");
		const item = await fromUuid(CONFIG.BlackFlag.weapons.simple.children.quarterstaff.link);
		data = { ...foundry.utils.flattenObject(item.toObject()), ...data };
		data.type = "weapon";
	} else findType(CONFIG.BlackFlag.gearCategories, parser, data);

	// Attunement, Rarity, & Price
	data["system.rarity"] = parser.consumeEnum(CONFIG.BlackFlag.rarities.localized);
	data["system.attunement"] = parser.consumeAttunement();
	data["system.price.value"] = parser.consumeCost();
	data["system.price.denomination"] = "gp";
	if (!data["system.attunement"]) data["system.attunement"] = parser.consumeAttunement();

	// Description
	data["system.description.value"] = parser.consumeDescription();

	const properties = data["system.properties"] ?? [];
	if (!properties.includes("magical")) properties.push("magical");
	data["system.properties"] = properties;

	return new Item.implementation(foundry.utils.expandObject(data));
}

function findType(config, parser, data) {
	let type;
	type = parser.consumeEnum(config.localized, { extra: ", " });
	if (type) {
		data["system.type.category"] = type;
	} else if (!type) {
		for (const [key, data] of Object.entries(config)) {
			if (!data.children?.localized) continue;
			type = parser.consumeEnum(data.children.localized, { extra: ", " });
			if (type) {
				data["system.type.base"] = type;
				data["system.type.category"] = key;
			}
		}
	}
}
