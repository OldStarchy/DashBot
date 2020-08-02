import winston from 'winston';
import ChatServer from '../ChatServer/ChatServer';
import Message from '../ChatServer/Message';
import Command from '../Command';
import DashBot from '../DashBot';

export default class LoginCommand extends Command {
	readonly name = 'login';
	readonly description = 'Logs dashbot in to a server';

	constructor(private bot: DashBot) {
		super();
	}

	async run(message: Message, serverId?: string) {
		const servers = this.bot.servers.filter(server => !server.isConnected);
		if (servers.length === 0) {
			await message.channel.sendText('No servers to login to.');
			return;
		}

		let server: ChatServer | null = null;
		if (!serverId) {
			if (servers.length > 1) {
				await message.channel.sendText('Which server?');
				return;
			}

			server = servers[0];
		} else {
			server =
				servers.filter(server => server.id === serverId).shift() ??
				null;

			if (!server) {
				await message.channel.sendText("Couldn't find that server");
				return;
			}
		}
		message.channel.sendText('Connecting to server...');
		try {
			//TODO: this is weird, shouldn't need both of these calls
			await server.connect();
			await server.awaitConnected();

			await message.channel.sendText('Connected!');
		} catch (e) {
			winston.error("Couldn't log in to server on request");
			await message.channel.sendText("Couldn't connect! :(");
		}
	}
}
