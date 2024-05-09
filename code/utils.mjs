export function getProperty(object, keyPath) {
	if ( !keyPath ) return object;
	let target = object;
	for ( const part of keyPath.split(".") ) {
		if ( typeof target !== "object" || !(part in target) ) return;
		target = target[part];
	}
	return target
}

export function setProperty(object, keyPath, value) {
	if ( !keyPath ) return;
	let target = object;

	const parts = keyPath.split(".");
	const key = parts.pop();
	for ( const part of parts ) {
		target[part] ??= {};
		target = target[part];
	}

	target[key] = value;
}

/*
 * Portions of the core package (foundry.utils.randomID) repackaged in accordance with the "Limited License
 * Agreement for Module Development, found here: https://foundryvtt.com/article/license/
 */
export function randomID(length=16) {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const cutoff = 0x100000000 - (0x100000000 % chars.length);
	const random = new Uint32Array(length);
	do {
		crypto.getRandomValues(random);
	} while ( random.some(x => x >= cutoff) );
	let id = "";
	for ( let i = 0; i < length; i++ ) id += chars[random[i] % chars.length];
	return id;
}

