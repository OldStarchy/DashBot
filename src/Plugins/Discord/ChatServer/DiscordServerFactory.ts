import { Client, Intents } from 'discord.js';
import IdentityService from '../../../ChatServer/IdentityService';
import DiscordServer from './DiscordServer';

interface DiscordServerFactoryContext {
	identityService: IdentityService;
}

export default class DiscordServerFactory {
	make(
		serverConfig: DiscordServerConfig,
		context: DiscordServerFactoryContext
	) {
		const { identityService } = context;

		return new DiscordServer({
			id: serverConfig.id ?? 'Discord',
			discordClient: new Client({
				intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES],
				partials: ['CHANNEL'],
			}),
			botToken: serverConfig.botToken,
			identityService,
		});
	}
}
