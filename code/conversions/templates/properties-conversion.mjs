import { convertItemProperty } from "../configs/items.mjs";
import BaseConversion from "../base.mjs";

export default class PropertiesConversion extends BaseConversion {

	static paths = [
		["system.properties", "system.properties", i => i?.map(p => convertItemProperty(p))],
	];

}
