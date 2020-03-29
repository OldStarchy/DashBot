import Discord from 'discord.js';
import Person from '../Person';
import ChatServer from '../Server';
import DiscordIdentity from './DiscordIdentity';
import DiscordMessage from './DiscordMessage';
import DiscordTextChannel from './DiscordTextChannel';

export default class DiscordServer implements ChatServer {
	private channelCache: Record<string, DiscordTextChannel> = {};
	constructor(
		private discordClient: Discord.Client,
		private config: { botToken: string }
	) {}

	getName() {
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

	getPrivateChatChannel(person: Person) {
		return null;
	}

	getIdentityById(id: string) {
		return new DiscordIdentity(
			this.discordClient.users.find(user => user.id === id)
		);
	}
}
