import { default as parseGear } from "./gear.mjs";

export default function parseInput(type, input) {
	switch (type) {
		case "gear": return parseGear(input);
	}
}
