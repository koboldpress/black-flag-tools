import { getProperty, setProperty } from "../utils.mjs";
import BaseConversion from "./base.mjs";
import { convertActivationType, convertTimePeriod } from "./configs/activation.mjs";
import { convertSpellSchool } from "./configs/spellcasting.mjs";
import { convertDistanceUnit } from "./configs/units.mjs";
import { convertTargeting } from "./shared/targeting.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";

export default class SpellConversion extends BaseConversion {

	static templates = [
		ActivitiesConversion,
		ItemDescriptionConversion,
	];

	static paths = [
		["system.activation.cost",      "system.casting.value",																												    ],
		["system.activation.type",      "system.casting.type",                    convertActivationType                   ],
		["system.activation.condition", "system.casting.condition", 																									    ],
		["system.level",                "system.circle.base",																												    	],
		["system.materials.value",      "system.components.material.description",						    											    ],
		["system.materials.consumed",   "system.components.material.consumed",								        								    ],
		["system.materials.cost",       "system.components.material.cost",												  									    ],
		["system.duration.value",       "system.duration.value",																											    ],
		["system.duration.units",       "system.duration.units",                  convertTimePeriod                       ],
		["system.range.value",          "system.range.value",																													    ],
		["system.range.units",          "system.range.units",											convertDistanceUnit                     ],
		["system.school",               "system.school",                          convertSpellSchool								    	],
		["system.target",               "system.target",                          convertTargeting                        ],
		["system.preparation.mode",     "flags.black-flag.relationship.mode",								        									    ],
		["system.preparation.prepared", "flags.black-flag.relationship.prepared",								    									    ],
	];

	static postSteps = [
		SpellConversion.convertProperties,
	];

	static convertProperties(initial, final) {
		const properties = getProperty(initial, "system.properties");
		const components = [];
		const tags = [];
		for ( const prop of properties ?? [] ) {
			if ( prop === "vocal" ) components.push("verbal");
			else if ( ["somatic", "material"].includes(prop) ) components.push(prop);
			else tags.push(prop);
		}
		setProperty(final, "system.components", components);
		setProperty(final, "system.tags", tags);
	}
}
