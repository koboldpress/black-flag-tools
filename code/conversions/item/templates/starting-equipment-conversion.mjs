import { setProperty, staticID } from "../../../utils.mjs";
import BaseConversion from "../../base.mjs";
import { convertArmor } from "../../configs/armor.mjs";
import { convertTool } from "../../configs/tools.mjs";
import { convertWeapon } from "../../configs/weapons.mjs";

export default class StartingEquipmentConversion extends BaseConversion {

	static postSteps = [
		StartingEquipmentConversion.convertEquipment
	];

	static convertEquipment(initial, final, context) {
		const equipment = initial.system.startingEquipment;
		if ( !equipment?.length ) return;
		const advancement = {
			_id: staticID("bfEquipment"),
			type: "equipment",
			configuration: {
				pool: equipment.map(e => {
					if ( e.type === "armor" ) e.key = convertArmor(e.key);
					if ( e.type === "focus" ) return null;
					if ( e.type === "tool" ) e.key = convertTool(e.key);
					if ( e.type === "weapon" ) e.key = convertWeapon(e.key);
					return e;
				}).filter(_ => _)
			}
		};
		setProperty(final, `system.advancement.${advancement._id}`, advancement);
	}

}
