import { getProperty, setProperty } from "../../../utils.mjs";
import BaseConversion from "../../base.mjs";
import BaseAdvancementConversion from "../../advancement/base.mjs";
import ChooseFeaturesConversion from "../../advancement/choose-features.mjs";
import ChooseSpellsConversion from "../../advancement/choose-spells.mjs";
import GrantFeaturesConversion from "../../advancement/grant-features.mjs";
import GrantSpellsConversion from "../../advancement/grant-spells.mjs";
import ImprovementConversion from "../../advancement/improvement.mjs";
import ScaleValueConversion from "../../advancement/scale-value.mjs";
import SizeConversion from "../../advancement/size.mjs";
import TraitConversion from "../../advancement/trait.mjs";

export default class AdvancementConversion extends BaseConversion {

	static convert(initial, final) {
		const advancement = (getProperty(initial, "system.advancement") ?? []).reduce((obj, i) => {
			const spellData = getProperty(i, "configuration.spell");
			const hasSpellData = spellData?.ability?.length || spellData?.preparation || spellData?.uses?.max;

			let Converter;
			switch ( i.type ) {
				case "AbilityScoreImprovement": Converter = initial.type === "class" ? ImprovementConversion : null; break;
				case "ItemChoice":
					if ( getProperty(i, "configuration.type") === "spell" ) Converter = ChooseSpellsConversion;
					else Converter = hasSpellData ? ChooseSpellsConversion : ChooseFeaturesConversion;
					break;
				case "ItemGrant": Converter = hasSpellData ? GrantSpellsConversion : GrantFeaturesConversion; break;
				case "ScaleValue": Converter = ScaleValueConversion; break;
				case "Size": Converter = SizeConversion; break;
				case "Trait": Converter = TraitConversion; break;
			}
			if ( Converter ) {
				const f = Converter.convert(i);
				obj[f._id] = f;
			}
			return obj;
		}, {});

		setProperty(final, `system.advancement`, advancement);
	}

}
