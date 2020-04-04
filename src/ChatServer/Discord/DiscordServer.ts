import Discord from 'discord.js';
import { Logger } from 'winston';
import deferred from '../../util/deferred';
import AudioChannel from '../AudioChannel';
import ChatServer, { ChatServerEvents } from '../ChatServer';
import Identity from '../Identity';
import IdentityService from '../IdentityService';
import TextChannel from '../TextChannel';
import DiscordIdentity from './DiscordIdentity';
import DiscordMessage from './DiscordMessage';
import DiscordTextChannel from './DiscordTextChannel';

type TDiscordTextChannel = Discord.Message['channel'];

export default class DiscordServer
	implements ChatServer<DiscordIdentity, DiscordTextChannel> {
	private _channelCache: Record<string, DiscordTextChannel> = {};
	private _loggedIn = deferred<this>();
	constructor(
		private _discordClient: Discord.Client,
		private _config: { botToken: string },
		private _identityService: IdentityService,
		private _logger: Logger
	) {
		this._discordClient.on('ready', () => {
			this._loggedIn.resolve(this);
			this._logger.info('Logged in to discord');
		});
	}

	get id() {
		return 'Discord';
	}

	async connect() {
		await this._discordClient.login(this._config.botToken);
	}

	async disconnect() {
		await this._discordClient.destroy();
		this._loggedIn.reject('disconnected');
	}

	async awaitConnected() {
		return this._loggedIn;
	}

	on<T extends keyof ChatServerEvents>(
		event: T,
		listener: (...args: ChatServerEvents[T]) => void
	): void;
	on(event: string, listener: (...args: any[]) => void): this {
		switch (event) {
			case 'message':
				this._discordClient.on(event, message =>
					listener(
						new DiscordMessage(
							this.getChannel(message.channel),
							message
						)
					)
				);
				break;

			case 'presenceUpdate':
			// TODO: this
			// this._discordClient.on(event, presence => {
			// 	presence?.status
			// })
			default:
				// this._discordClient.on(event, listener);
				break;
		}

		return this;
	}

	private getChannel(internalChannel: TDiscordTextChannel) {
		const id = internalChannel.id;

		if (this._channelCache[id] === undefined) {
			this._channelCache[id] = new DiscordTextChannel(
				this,
				internalChannel
			);
		}

		return this._channelCache[id];
	}

	async getAudioChannels(): Promise<AudioChannel[]> {
		//TODO: this
		throw new Error('Not implemented');
	}

	async getTextChannels(): Promise<DiscordTextChannel[]> {
		return this._discordClient.channels.cache
			.filter(
				channel =>
					channel instanceof Discord.TextChannel ||
					channel instanceof Discord.DMChannel ||
					channel instanceof Discord.NewsChannel
			)
			.map(channel => this.getChannel(channel as TDiscordTextChannel));
	}

	async getTextChannel(id: string) {
		const channel = await this._discordClient.channels.fetch(id);
		if (channel) {
			return this.getChannel(channel as TDiscordTextChannel);
		}

		return null;
	}

	async getPrivateTextChannel(
		identity: DiscordIdentity
	): Promise<DiscordTextChannel>;
	async getPrivateTextChannel(
		identity: Identity
	): Promise<TextChannel | null> {
		if (identity instanceof DiscordIdentity) {
			const dm = await identity.getDiscordUser().createDM();

			return this.getChannel(dm);
		}

		return null;
	}

	async getIdentityById(id: string) {
		return new DiscordIdentity(
			this,
			await this._discordClient.users.fetch(id)
		);
	}

	getIdentityService() {
		return this._identityService;
	}
}
