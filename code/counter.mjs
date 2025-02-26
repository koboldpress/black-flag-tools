const countedCache = {
	module: new Map(),
	pack: new Map()
};

export default function setupCounter() {
	if (!game.settings.get("black-flag-tools", "image-counter")) return;

	for (const pack of game.packs) {
		for (const index of pack.index) {
			increaseCount(pack, index.img);
		}
	}

	// Monkey patch DocumentSheet#_onEditImage to pass necessary info
	const _oldMethod = DocumentSheet._onEditImage;
	DocumentSheet.prototype._onEditImage = function (event) {
		const attr = event.currentTarget.dataset.edit;
		const current = foundry.utils.getProperty(this.object, attr);
		const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {};
		const fp = new FilePicker({
			current,
			type: "image",
			redirectToRoot: img ? [img] : [],
			callback: path => {
				event.currentTarget.src = path;
				if (this.options.submitOnChange) return this._onSubmit(event);
			},
			top: this.position.top + 40,
			left: this.position.left + 10,
			document: this.document
		});
		return fp.browse();
	};

	Hooks.on("preUpdateItem", (item, updates, options, userId) => {
		if (item.pack && "img" in updates && item.img !== updates.img) {
			const pack = game.packs.get(item.pack);
			decreaseCount(pack, item.img);
			increaseCount(pack, updates.img);
		}
	});

	Hooks.on("renderFilePicker", (application, element, context) => {
		const html = element instanceof HTMLElement ? element : element[0];
		const pack = game.packs.get(application.options.document?.pack);
		if (!pack) return;
		for (const img of html.querySelectorAll(".file[data-path]")) {
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

function increaseCount(pack, img) {
	_modifyBothCounts(pack, img, 1);
}

function decreaseCount(pack, img) {
	_modifyBothCounts(pack, img, -1);
}

function _modifyBothCounts(pack, img, delta) {
	_modifyCount("module", pack.metadata.packageName, img, delta);
	_modifyCount("pack", pack.metadata.id, img, delta);
}

function _modifyCount(type, id, img, delta) {
	if (!countedCache[type].has(id)) countedCache[type].set(id, new Map());
	const map = countedCache[type].get(id);
	map.set(img, Math.max(0, (map.get(img) ?? 0) + delta));
	return map.get(img);
}

/* <><><><> <><><><> <><><><> <><><><> <><><><> <><><><> */

function getCounts(pack, img) {
	return {
		module: countedCache.module.get(pack.metadata.packageName)?.get(img) || "–",
		pack: countedCache.pack.get(pack.metadata.id)?.get(img) || "–"
	};
}
