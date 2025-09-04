const countedCache = {
	module: new Map(),
	pack: new Map()
};

/**
 * Set up the counter to display when file picker is launched.
 */
export default function setupCounter() {
	for (const pack of game.packs) {
		for (const index of pack.index) {
			increaseCount(pack, index.img);
		}
	}

	Hooks.on("preUpdateItem", (item, updates, options, userId) => {
		if (item.pack && "img" in updates && item.img !== updates.img) {
			const pack = game.packs.get(item.pack);
			decreaseCount(pack, item.img);
			increaseCount(pack, updates.img);
		}
	});

	Hooks.on("renderFilePicker", (application, element, context) => {
		const pack = game.packs.get(application.options.document?.pack);
		if (!pack) return;
		for (const img of element.querySelectorAll(".file[data-path]")) {
			const path = img.dataset.path;
			const counts = getCounts(pack, path);
			const div = document.createElement("div");
			div.classList.add("black-flag-tools-counts");
			div.innerHTML = `
				<div data-tooltip="${game.i18n.format("BFTools.Counter.Tooltip", counts)}">
					${counts.pack} / ${counts.module}
				</div>
			`;
			img.insertAdjacentElement("beforeend", div);
		}
	});
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Increase the count for an image in a pack.
 * @param {Compendium} pack
 * @param {string} img
 */
function increaseCount(pack, img) {
	_modifyBothCounts(pack, img, 1);
}

/**
 * Decrease the count for an image in a pack.
 * @param {Compendium} pack
 * @param {string} img
 */
function decreaseCount(pack, img) {
	_modifyBothCounts(pack, img, -1);
}

/**
 * Modify an image's count across the module and the specific pack.
 * @param {Compendium} pack
 * @param {string} img
 * @param {number} delta
 */
function _modifyBothCounts(pack, img, delta) {
	_modifyCount("module", pack.metadata.packageName, img, delta);
	_modifyCount("pack", pack.metadata.id, img, delta);
}

/**
 * Modify an image's count of a certain type.
 * @param {string} type
 * @param {string} id
 * @param {string} img
 * @param {number} delta
 * @returns {number}
 */
function _modifyCount(type, id, img, delta) {
	if (!countedCache[type].has(id)) countedCache[type].set(id, new Map());
	const map = countedCache[type].get(id);
	map.set(img, Math.max(0, (map.get(img) ?? 0) + delta));
	return map.get(img);
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

/**
 * Get the module and pack counts for an image path specified.
 * @param {Compendium} pack
 * @param {string} img
 * @returns {{ module: number pack: number }}
 */
function getCounts(pack, img) {
	return {
		module: countedCache.module.get(pack.metadata.packageName)?.get(img) || "–",
		pack: countedCache.pack.get(pack.metadata.id)?.get(img) || "–"
	};
}
