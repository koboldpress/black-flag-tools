export function convertTargeting(initial) {
	const final = { template: {}, affects: {} };

	let { value, width, units, type } = initial ?? {};
	let isIndividual = true;
	switch (type) {
		case "wall":
			type = "line";
		case "line":
			final.template.width = width;
		case "cone":
		case "cube":
		case "cylinder":
		case "line":
		case "radius":
		case "sphere":
		case "square":
			final.template.type = type;
			final.template.size = value;
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

	if (isIndividual) {
		final.affects.count = value;
		final.affects.type = type;
	}

	return final;
}
