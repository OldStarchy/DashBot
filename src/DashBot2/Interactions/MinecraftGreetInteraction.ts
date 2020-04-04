import DashBot2 from '../DashBot2';
import { Event } from '../Events';
import Identity from '../Identity';
import Interaction from '../Interaction';
import MinecraftServer from '../Minecraft/MinecraftServer';

export default class MinecraftGreetInteraction implements Interaction {
	register(bot: DashBot2) {
		bot.on('presenceUpdate', this.onUserJoined.bind(this));
	}

	private async onUserJoined(
		event: Event<{
			identity: Identity;
			joined: boolean;
		}>
	) {
		const { identity, joined } = event.data;

		if (joined && identity.server instanceof MinecraftServer) {
			await (await identity.server.getTextChannels())[0].sendText(
				`Welcome to the server ${identity.username}`
			);
		}
	}
}
