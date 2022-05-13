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
				intents: [
					// Both GUILDS and GUILD_MESSAGES are required to get messages in server channels.
					// these permissions are a pain so i'm leaving them all in except these two, see here
					// https://discord.com/developers/docs/topics/gateway#privileged-intents

					Intents.FLAGS.GUILDS,
					// Intents.FLAGS.GUILD_MEMBERS,
					Intents.FLAGS.GUILD_BANS,
					Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
					Intents.FLAGS.GUILD_INTEGRATIONS,
					Intents.FLAGS.GUILD_WEBHOOKS,
					Intents.FLAGS.GUILD_INVITES,
					Intents.FLAGS.GUILD_VOICE_STATES,
					// Intents.FLAGS.GUILD_PRESENCES,
					Intents.FLAGS.GUILD_MESSAGES,
					Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
					Intents.FLAGS.GUILD_MESSAGE_TYPING,
					Intents.FLAGS.DIRECT_MESSAGES,
					Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
					Intents.FLAGS.DIRECT_MESSAGE_TYPING,
					Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
				],
				partials: ['CHANNEL'],
			}),
			botToken: serverConfig.botToken,
			identityService,
		});
	}
}
