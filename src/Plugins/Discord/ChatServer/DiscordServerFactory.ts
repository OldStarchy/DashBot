import { Client } from 'discord.js';
import { Logger } from 'winston';
import IdentityService from '../../../ChatServer/IdentityService';
import DiscordServer from './DiscordServer';

interface DiscordServerFactoryContext {
	identityService: IdentityService;
	logger: Logger;
}

export default class DiscordServerFactory {
	make(
		serverConfig: DiscordServerConfig,
		context: DiscordServerFactoryContext
	) {
		const { identityService, logger } = context;

		return new DiscordServer({
			id: serverConfig.id ?? 'Discord',
			discordClient: new Client(),
			botToken: serverConfig.botToken,
			identityService,
			logger,
		});
	}
}
