import BaseConversion from "../../base.mjs";
import { convertSize } from "../../configs/actors.mjs";
import MovementConversion from "../../shared/templates/movement-conversion.mjs";
import SensesConversion from "../../shared/templates/senses-conversion.mjs";

export default class TraitsConversion extends BaseConversion {

	static templates = [
		MovementConversion,
		SensesConversion,
	];

	static paths = [
		["system.traits.size", "system.traits.size", convertSize],
	];

}
