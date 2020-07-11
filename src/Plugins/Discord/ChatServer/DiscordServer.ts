import Discord from 'discord.js';
import { Logger } from 'winston';
import AudioChannel from '../../../ChatServer/AudioChannel';
import ChatServer from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';
import IdentityService from '../../../ChatServer/IdentityService';
import TextChannel from '../../../ChatServer/TextChannel';
import { CancellableEvent, EventHandler } from '../../../Events';
import deferred from '../../../util/deferred';
import DiscordIdentity from './DiscordIdentity';
import DiscordMessage from './DiscordMessage';
import DiscordTextChannel from './DiscordTextChannel';

type TDiscordTextChannel = Discord.Message['channel'];

export interface DiscordServerOptions {
	id: string;
	discordClient: Discord.Client;
	botToken: string;
	identityService: IdentityService;
	logger: Logger;
}

export default class DiscordServer
	implements ChatServer<DiscordIdentity, DiscordTextChannel> {
	private _channelCache: Record<string, DiscordTextChannel> = {};
	private _loggedIn = deferred<this>();

	private _id: string;
	private _discordClient: Discord.Client;
	private _botToken: string;
	private _identityService: IdentityService;
	private _logger: Logger;

	constructor(options: DiscordServerOptions) {
		({
			id: this._id,
			discordClient: this._discordClient,
			botToken: this._botToken,
			identityService: this._identityService,
			logger: this._logger,
		} = options);

		this._discordClient.on('ready', () => {
			this._loggedIn.resolve(this);
			this._logger.info('Logged in to discord');
		});
	}

	get id() {
		return this._id;
	}

	get me() {
		return new DiscordIdentity(this, this._discordClient.user!);
	}

	async connect() {
		await this._discordClient.login(this._botToken);
		await this._loggedIn;
	}

	async disconnect() {
		await this._discordClient.destroy();
		this._loggedIn.reject('disconnected');
	}

	async awaitConnected() {
		return this._loggedIn;
	}

	on(event: string, handler: EventHandler<any>): void {
		switch (event) {
			case 'message':
				this._discordClient.on(event, message =>
					handler(
						new CancellableEvent(
							'message',
							new DiscordMessage(
								this.getChannel(message.channel),
								message
							)
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
				// this._discordClient.on(event, handler);
				break;
		}
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
