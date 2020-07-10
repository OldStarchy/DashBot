import { Logger } from 'winston';
import ChatServer from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';
import Interaction from '../../../ChatServer/Interaction';
import DashBot from '../../../DashBot';
import { Event } from '../../../Events';
import DeathMessage from '../../../MinecraftLogClient/PlayerDeathMessage';
import sleep from '../../../util/sleep';
import MinecraftServer from '../ChatServer/MinecraftServer';

export default class MinecraftGreetInteraction implements Interaction {
	constructor(private _logger: Logger) {}
	register(bot: DashBot) {
		bot.on('presenceUpdate', this.onUserJoined.bind(this));
		bot.on('game.death', this.onPlayerDeath.bind(this));
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

	private async onPlayerDeath(
		event: Event<{ message: DeathMessage; server: ChatServer }>
	) {
		const { message, server } = event.data;

		if (!message.player) return;
		if (!(server instanceof MinecraftServer)) return;

		const channel = (await server.getTextChannels())[0];

		await sleep(1000 + Math.random() * 1000);
		channel.sendText('RIP my dude');
		this._logger.info(message.content);

		if (message.enemy) {
			const rcon = server.getRcon();

			if (!rcon) {
				return;
			}

			try {
				await rcon.give(
					message.enemy,
					'minecraft:player_head',
					1,
					`{SkullOwner:${message.player}}`
				);
			} catch (e) {
				this._logger.error(e);
			}
		}
	}
}
