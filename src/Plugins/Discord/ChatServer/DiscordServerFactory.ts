import { Client } from 'discord.js';
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
			discordClient: new Client(),
			botToken: serverConfig.botToken,
			identityService,
		});
	}
}
