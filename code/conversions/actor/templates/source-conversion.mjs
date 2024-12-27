import BaseConversion from "../../base.mjs";

export default class SourceConversion extends BaseConversion {
	static paths = [
		["system.source.book",   "system.description.source.book"    ],
		["system.source.custom", "system.description.source.fallback"],
		["system.source.page",   "system.description.source.page"    ],
	];
}
