import { staticID } from "../../utils.mjs";
import BaseConversion from "../base.mjs";

export default class StartingEquipmentConversion extends BaseConversion {

	static postSteps = [
		StartingEquipmentConversion.convertEquipment
	];

	static convertEquipment(initial, final) {
		const advancement = {
			_id: staticID("bfEquipment"),
			type: "equipment",
			configuration: {
				// TODO: Convert from starting equipment
			}
		};
	}

}
