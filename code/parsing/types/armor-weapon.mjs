import Parser from "../parser.mjs";
import parseEnchantment from "./enchantment.mjs";

export default async function parseArmorWeapon(type, input) {
	let data = { type };
	const parser = new Parser(input);

	// Name
	data.name = parser.consumeLine();

	// Type
	const item = await findBaseData(parser, type);
	if (!item) return parseEnchantment("enchantment", input);
	data = { ...item, ...data };

	// Attunement, Rarity, & Price
	data["system.rarity"] = parser.consumeEnum(CONFIG.BlackFlag.rarities.localized);
	data["system.attunement"] = parser.consumeAttunement();
	data["system.price.value"] = parser.consumeCost(data.system?.price?.value);
	data["system.price.denomination"] = "gp";
	if (!data["system.attunement"]) data["system.attunement"] = parser.consumeAttunement();

	// Description
	data["system.description.value"] = parser.consumeDescription();

	return new Item.implementation(foundry.utils.expandObject(data));
}

async function findBaseData(parser, itemType) {
	const match = parser.consumeRegex(/\s*(?<kind>Armor|Weapon)\s+\((?<type>[^)]+)\),\s*/i);
	if (!match) return null;

	let config;
	switch (itemType) {
		case "ammunition":
			config = CONFIG.BlackFlag.ammunition;
			break;
		case "armor":
			config = CONFIG.BlackFlag.armor;
			break;
		case "weapon":
			config = CONFIG.BlackFlag.weapons;
			break;
	}
	if (!config) return null;
	const type = match.groups.type.toLowerCase();

	let uuid;
	const check = config => {
		for (const data of Object.values(config)) {
			const label = BlackFlag.utils.makeLabel(data)?.toLowerCase();
			if (data.link && label === type) {
				uuid = data.link;
				break;
			}
			if (data.children) check(data.children);
			if (uuid) return;
		}
	};
	check(config);

	const item = await fromUuid(uuid);
	if (!item) return null;

	const data = item.toObject();
	delete data._id;
	return foundry.utils.flattenObject(data);
}
