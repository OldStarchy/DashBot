import Discord from 'discord.js';
import winston from 'winston';
import AudioChannel from '../../../ChatServer/AudioChannel';
import ChatServer, { ChatServerEvents } from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';
import IdentityService from '../../../ChatServer/IdentityService';
import TextChannel from '../../../ChatServer/TextChannel';
import { CancellableEvent, EventEmitter } from '../../../Events';
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
}

type DiscordServerEvents = ChatServerEvents;

export default class DiscordServer extends EventEmitter<DiscordServerEvents>
	implements ChatServer<DiscordIdentity, DiscordTextChannel> {
	private _channelCache: Record<string, DiscordTextChannel> = {};
	private _loggedIn = deferred<this>();

	private _id: string;
	private _discordClient: Discord.Client;
	private _botToken: string;
	private _identityService: IdentityService;

	constructor(options: DiscordServerOptions) {
		super();
		({
			id: this._id,
			discordClient: this._discordClient,
			botToken: this._botToken,
			identityService: this._identityService,
		} = options);

		this._discordClient.on('ready', () => {
			this._loggedIn.resolve(this);
			winston.info('Logged in to discord');
		});

		this._discordClient.on('message', message =>
			this.emit(
				new CancellableEvent(
					'message',
					new DiscordMessage(
						this.getChannel(message.channel),
						message
					)
				)
			)
		);
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
		this._discordClient.destroy();
		this._loggedIn.reject('disconnected');
	}

	async awaitConnected() {
		return this._loggedIn;
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
