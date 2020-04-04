import Discord from 'discord.js';
import Identity from '../Identity';
import IdentityService from '../IdentityService';
import ChatServer from '../Server';
import TextChannel from '../TextChannel';
import DiscordIdentity from './DiscordIdentity';
import DiscordMessage from './DiscordMessage';
import DiscordTextChannel from './DiscordTextChannel';

export default class DiscordServer
	implements ChatServer<DiscordIdentity, DiscordTextChannel> {
	private channelCache: Record<string, DiscordTextChannel> = {};
	constructor(
		private discordClient: Discord.Client,
		private config: { botToken: string },
		private identityService: IdentityService
	) {}

	get id() {
		return 'Discord';
	}

	async connect() {
		await this.discordClient.login(this.config.botToken);
	}

	async disconnect() {
		await this.discordClient.destroy();
	}

	on(event: string, listener: (...args: any[]) => void): this {
		switch (event) {
			case 'message':
				this.discordClient.on(event, message =>
					listener(
						new DiscordMessage(
							this.getChannel(message.channel),
							message
						)
					)
				);
				break;

			default:
				this.discordClient.on(event, listener);
				break;
		}

		return this;
	}

	private getChannel(
		internalChannel:
			| Discord.TextChannel
			| Discord.DMChannel
			| Discord.GroupDMChannel
	) {
		const id = internalChannel.id;

		if (this.channelCache[id] === undefined) {
			this.channelCache[id] = new DiscordTextChannel(
				this,
				internalChannel
			);
		}

		return this.channelCache[id];
	}

	async getAudioChannels() {
		//TODO: this
		return [];
	}

	async getTextChannels() {
		//TODO: this
		return [];
	}

	async getPrivateTextChannel(
		identity: DiscordIdentity
	): Promise<DiscordTextChannel>;
	async getPrivateTextChannel(
		identity: Identity
	): Promise<TextChannel | null> {
		if (identity instanceof DiscordIdentity) {
			const dm = await identity.getDiscordUser().createDM();

			return new DiscordTextChannel(this, dm);
		}

		return null;
	}

	getIdentityById(id: string) {
		return new DiscordIdentity(
			this,
			this.discordClient.users.find(user => user.id === id)
		);
	}

	getIdentityService() {
		return this.identityService;
	}
}
