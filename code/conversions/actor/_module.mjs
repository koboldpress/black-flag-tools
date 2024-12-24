import BaseConversion from "../base.mjs";
import NPCConversion from "./npc.mjs";

export default function selectActorConverter(data) {
	switch (data.type) {
		case "npc":
			return NPCConversion;
		default:
			throw new Error(`Actors of the type "${data.type}" are not currently supported.`);
	}
}
