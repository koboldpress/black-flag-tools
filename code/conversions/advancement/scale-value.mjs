import { getProperty } from "../../utils.mjs";
import { convertDistanceUnit } from "../configs/units.mjs";
import BaseActivityConversion from "./base.mjs";

export default class ScaleValueConversion extends BaseActivityConversion {
	static advancementType = "scaleValue";

	static paths = [
		["configuration.identifier", "identifier"],
		["configuration.type", "configuration.type"]
	];

	static postSteps = [ScaleValueConversion.convertScale];

	static convertScale(initial, final) {
		final.scale = {};
		for (const [k, i] of Object.entries(getProperty(initial, "configuration.scale") ?? {})) {
			const f = {};
			switch (getProperty(initial, "configuration.type")) {
				case "cr":
				case "number":
				case "string":
					f.value = i.value;
					break;
				case "dice":
					f.number = i.number;
					f.denomination = i.faces;
					break;
				case "distance":
					f.value = i.value;
					f.units = convertDistanceUnit(initial.distance?.units);
					break;
			}
			final.scale[k] = f;
		}
	}
}
