import BaseConversion from "../base.mjs";
import selectActorConverter from "../actor/_module.mjs";
import NPCConversion from "../actor/npc.mjs";

export default class SceneConversion extends BaseConversion {
	static convertBase(initial, context) {
		const final = super.convertBase(initial, context);

		for (const data of final.tokens ?? []) {
			// Assume all pre-placed actors in scenes are NPCs
			let Converter = NPCConversion;

			// If adventure data is available in context, get proper actor type from adventure actor
			if (context.adventure) {
				const worldActor = context.adventure.actors?.find(a => a._id === data.actorId);
				if (worldActor) Converter = selectActorConverter(worldActor);
			}

			data.delta = Converter.convert(data.delta, null, {
				...context,
				delta: true,
				parentDocument: initial,
				type: "ActorDelta"
			});
		}

		return final;
	}
}
