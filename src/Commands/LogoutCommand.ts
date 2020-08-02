import winston from 'winston';
import ChatServer from '../ChatServer/ChatServer';
import Message from '../ChatServer/Message';
import Command from '../Command';
import DashBot from '../DashBot';

export default class LogoutCommand extends Command {
	readonly name = 'logout';
	readonly description =
		'Logs out of the given server (or the current one if no server was specified)';

	constructor(private bot: DashBot) {
		super();
	}

	async run(message: Message, serverId?: string) {
		const servers = this.bot.servers.filter(server => server.isConnected);

		if (servers.length === 1) {
			await message.channel.sendText(
				"Not logging out, this is the only server I'm connected to"
			);
			return;
		}

		let server: ChatServer | null = null;
		if (!serverId) {
			server = message.channel.server;
		} else {
			server =
				servers.filter(server => server.id === serverId).shift() ??
				null;

			if (!server) {
				await message.channel.sendText("Couldn't find that server");
				return;
			}
		}

		message.channel.sendText('Disconnecting');
		try {
			await server.disconnect();

			if (message.channel.server.isConnected) {
				await message.channel.sendText('Connected!');
			}
		} catch (e) {
			winston.error("Couldn't log in to server on request");

			if (message.channel.server.isConnected) {
				await message.channel.sendText("Couldn't disconnect! :(");
			}
		}
	}
}
