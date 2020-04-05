import { Client } from 'discord.js';
import { Logger } from 'winston';
import IdentityService from '../IdentityService';
import DiscordServer from './DiscordServer';

export interface DiscordServerConfig extends ChatServerConfig {
	type: 'discord';
	botToken: string;
}

export default class DiscordServerFactory {
	make(
		serverConfig: DiscordServerConfig,
		identityService: IdentityService,
		logger: Logger
	) {
		return new DiscordServer(
			serverConfig.id ?? 'Discord',
			new Client(),
			{ botToken: serverConfig.botToken },
			identityService,
			logger
		);
	}
}
