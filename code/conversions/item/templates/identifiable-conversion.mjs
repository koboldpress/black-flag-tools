import BaseConversion from "../../base.mjs";

export default class IdentifiableConversion extends BaseConversion {

	static paths = [
		["system.identified",               "system.unidentified.value",       i => !i],
		["system.unidentified.name",        "system.unidentified.name",               ],
		["system.unidentified.description", "system.unidentified.description",        ],
	];

}
