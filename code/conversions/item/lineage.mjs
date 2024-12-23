import { getProperty, randomID, setProperty } from "../../utils.mjs";
import BaseConversion from "../base.mjs";
import { convertSize } from "../configs/actors.mjs";
import AdvancementConversion from "./templates/advancement-conversion.mjs";
import ConceptConversion from "./templates/concept-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";

export default class LineageConversion extends BaseConversion {
	static preSteps = [(i, f) => (f.type = "lineage")];

	static templates = [AdvancementConversion, ConceptConversion, ItemDescriptionConversion];

	static postSteps = [
		LineageConversion.convertMovement,
		LineageConversion.convertSenses,
		LineageConversion.convertType
	];

	static addAdvancement(title, changes, final) {
		const advancement = { _id: randomID(), type: "property", configuration: { changes }, title };
		setProperty(final, `system.advancement.${advancement._id}`, advancement);
	}

	static convertMovement(initial, final) {
		const movement = getProperty(initial, "system.movement") ?? {};
		const changes = [];
		if (movement.walk) changes.push({ key: "system.traits.movement.base", mode: 5, value: `${movement.walk}` });
		for (const t of ["burrow", "climb", "fly", "swim"]) {
			if (movement[t]) changes.push({ key: `system.traits.movement.type.${t}`, mode: 5, value: `${movement[t]}` });
		}
		if (movement.hover) changes.push({ key: "system.traits.movement.tags", mode: 2, value: "hover" });
		if (changes.length) LineageConversion.addAdvancement("Movement", changes, final);
	}

	static convertSenses(initial, final) {
		const senses = getProperty(initial, "system.senses") ?? {};
		const changes = [];
		for (const t of ["darkvision", "blindsight", "tremorsense", "truesight"]) {
			if (senses[t])
				changes.push({
					key: `system.traits.senses.types.${t === "blindsight" ? "keensense" : t}`,
					mode: 2,
					value: `${senses[t]}`
				});
		}
		if (changes.length) LineageConversion.addAdvancement("Senses", changes, final);
	}

	static convertType(initial, final) {
		const type = getProperty(initial, "system.type") ?? {};
		const changes = [];
		if (type.value) changes.push({ key: "system.traits.type.value", mode: 5, value: type.value });
		if (type.subtype) {
			const custom = type.subtype.split(",");
			for (const c of custom) changes.push({ key: "system.traits.type.custom", mode: 2, value: c.trim() });
		}
		if (type.swarm) changes.push({ key: "system.traits.type.swarm", mode: 5, value: convertSize(type.swarm) });
		if (changes.length) LineageConversion.addAdvancement("Creature Type", changes, final);
	}
}
