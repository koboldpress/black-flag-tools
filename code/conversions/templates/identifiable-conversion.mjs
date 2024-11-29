import BaseConversion from "../base.mjs";

export default class IdentifiableConversion extends BaseConversion {
	
	static paths = [
		["system.identified",               null],
		["system.unidentified.name",        null],
		["system.unidentified.description", null],
	];

}
