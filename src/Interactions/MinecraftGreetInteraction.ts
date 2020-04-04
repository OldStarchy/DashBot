import Identity from '../ChatServer/Identity';
import Interaction from '../ChatServer/Interaction';
import MinecraftServer from '../ChatServer/Minecraft/MinecraftServer';
import DashBot from '../DashBot';
import { Event } from '../Events';

export default class MinecraftGreetInteraction implements Interaction {
	register(bot: DashBot) {
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
