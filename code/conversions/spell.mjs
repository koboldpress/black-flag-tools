import { getProperty, setProperty } from "../utils.mjs";
import BaseConversion from "./base.mjs";
import { convertActivationType, convertTimePeriods } from "./configs/activation.mjs";
import { convertSpellSchool } from "./configs/spellcasting.mjs";
import { convertDistanceUnits } from "./configs/units.mjs";
import ActivitiesConversion from "./templates/activities-conversion.mjs";
import ItemDescriptionConversion from "./templates/item-description-conversion.mjs";

export default class SpellConversion extends BaseConversion {

	static templates = [
		ActivitiesConversion,
		ItemDescriptionConversion
	];

	static paths = [
		["system.level",                "system.circle.base",																												    	],
		["system.activation.cost",      "system.casting.value",																												    ],
		["system.activation.type",      "system.casting.type",                    convertActivationType                   ],
		["system.activation.condition", "system.casting.condition", 																									    ],
		["system.materials.value",      "system.components.material.description",						    											    ],
		["system.materials.consumed",   "system.components.material.consumed",								        								    ],
		["system.materials.cost",       "system.components.material.cost",												  									    ],
		["system.duration.value",       "system.duration.value",																											    ],
		["system.duration.units",       "system.duration.units",                  convertTimePeriods                      ],
		["system.range.value",          "system.range.value",																													    ],
		["system.range.units",          "system.range.units",											convertDistanceUnits                    ],
		["system.school",               "system.school",                          convertSpellSchool								    	],
		["system.preparation.mode",     "flags.black-flag.relationship.mode",								        									    ],
		["system.preparation.prepared", "flags.black-flag.relationship.prepared",								    									    ]
	];

	static postSteps = [
		SpellConversion.convertProperties,
		SpellConversion.convertTargets
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

	static convertTargets(initial, final) {
		let { value, width, units, type } = getProperty(initial, "system.target") ?? {};
		let isIndividual = true;
		switch ( type ) {
			case "wall":
				type = "line";
			case "line":
				setProperty(final, "system.target.template.width", width);
			case "cone":
			case "cube":
			case "cylinder":
			case "line":
			case "radius":
			case "sphere":
			case "square":
				setProperty(final, "system.target.template.type", type);
				setProperty(final, "system.target.template.size", value);
				isIndividual = false;
				break;

			case "any":
			case "self":
				type = null;
				break;
			case "creatureOrObject":
				type = "creatureObject";
				break;
			case "creature":
			case "ally":
			case "enemy":
			case "willing":
			case "object":
			case "space":
				break;
		}

		if ( isIndividual ) {
			setProperty(final, "system.affects.count", value);
			setProperty(final, "system.affects.type", type);
		}
	}
}
