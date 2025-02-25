import MersenneTwister from "./mersenne.mjs";

export const TOOLS = {};

export const generator = new MersenneTwister();

export function getProperty(object, keyPath) {
	if (!keyPath) return object;
	let target = object;
	for (const part of keyPath.split(".")) {
		if (typeof target !== "object" || !(part in target)) return;
		target = target[part];
	}
	return target;
}

export function setProperty(object, keyPath, value) {
	if (!keyPath) return;
	let target = object;

	const parts = keyPath.split(".");
	const key = parts.pop();
	for (const part of parts) {
		target[part] ??= {};
		target = target[part];
	}

	target[key] = value;
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */
/*                     ID Generation                     */
/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Generate a random ID using the provided prefix from a document name.
 * @param {string} name
 * @param {object} [option={}]
 * @param {string} [options.prefix] - Prefix added before the title.
 * @param {string} [options.type] - Document type being created.
 * @returns {string}
 */
export function generateID(name, { prefix = "", type = "" } = {}) {
	const text = name.slugify({ replacement: "", strict: true, lowercase: false });
	return staticID(`${prefix}${type.slice(0, 2).toUpperCase()}${text}`);
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Generate an ID from the input string that is exactly 16 characters long.
 * @param {string} id - Initial string that contains only valid ID characters.
 * @returns {string}
 */
export function staticID(id) {
	if (id.length >= 16) return id.substring(0, 16);
	return id.padEnd(16, "0");
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */
/*                      Randomness                       */
/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

const base62Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function getRandomValues(array) {
	for (let i = 0; i < array.length; i++) {
		array[i] = generator.random_int();
	}
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

export function seedRandom(id) {
	const chars = base62Chars.split("");
	const parts = id.split("");
	let seed = 0;
	while (parts.length) {
		const value = parts.pop();
		const index = chars.findIndex(c => c === value);
		seed += index + 1;
	}
	generator.init_seed(seed);
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/*
 * Portions of the core package (foundry.utils.randomID) repackaged in accordance with the "Limited License
 * Agreement for Module Development, found here: https://foundryvtt.com/article/license/
 */
export function randomID(length = 16) {
	const cutoff = 0x100000000 - (0x100000000 % base62Chars.length);
	const random = new Uint32Array(length);
	do {
		getRandomValues(random);
	} while (random.some(x => x >= cutoff));
	let id = "";
	for (let i = 0; i < length; i++) id += base62Chars[random[i] % base62Chars.length];
	return id;
}
