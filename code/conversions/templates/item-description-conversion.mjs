import BaseConversion from "../base.mjs";

export default class ItemDescriptionConversion extends BaseConversion {
	static paths = [
		["system.description.value",    "system.description.value"          ],
		["system.source.book",          "system.description.source.book"    ],
		["system.source.custom",        "system.description.source.fallback"],
		["system.source.page",          "system.description.source.page"    ],
	];
}
