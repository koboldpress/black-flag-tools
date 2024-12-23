import BaseConversion from "../../base.mjs";

export default class ItemDescriptionConversion extends BaseConversion {
	static paths = [
		["system.description.chat",     null                                ],
		["system.description.value",    "system.description.value"          ],
		["system.identifier",           "system.identifier.value"           ],
		["system.source.book",          "system.description.source.book"    ],
		["system.source.custom",        "system.description.source.fallback"],
		["system.source.page",          "system.description.source.page"    ],
	];
}
