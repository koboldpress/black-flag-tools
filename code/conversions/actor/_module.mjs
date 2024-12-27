import BaseConversion from "../base.mjs";
import ConversionError from "../error.mjs";
import NPCConversion from "./npc.mjs";
import VehicleConversion from "./vehicle.mjs";

export default function selectActorConverter(data) {
	switch (data.type) {
		case "npc":
			return NPCConversion;
		case "vehicle":
			return VehicleConversion;
		default:
			throw new ConversionError(`Actors of the type "${data.type}" are not currently supported.`);
	}
}
