import { convertSize } from "../configs/actors.mjs";
import BaseActivityConversion from "./base.mjs";

export default class SizeConversion extends BaseActivityConversion {
	static advancementType = "size";

	static paths = [
		["configuration.hint", "hint"],
		["configuration.sizes", "configuration.options", SizeConversion.convertSizes]
	];

	static convertSizes(initial) {
		return initial?.map(i => convertSize(i));
	}
}
