import ChatServer, { ChatServerEvents } from '../../../ChatServer/ChatServer';
import IdentityService from '../../../ChatServer/IdentityService';
import { CancellableEvent, EventEmitter } from '../../../Events';
import MinecraftLogClient from '../LogClient/MinecraftLogClient';
import DeathMessage from '../LogClient/PlayerDeathMessage';
import RconClient from '../Rcon/RconClient';
import MinecraftIdentity from './MinecraftIdentity';
import MinecraftIdentityCache from './MinecraftIdentityCache';
import MinecraftMessage from './MinecraftMessage';
import MinecraftTextChannel from './MinecraftTextChannel';

/**
 * Enables communication with a Minecraft server
 */
export interface MinecraftServerOptions {
	id: string;
	logClient: MinecraftLogClient;
	rcon: RconClient | null;
	identityService: IdentityService;
	botName: string;
	minecraftIdentityCache: MinecraftIdentityCache;
	knownBotUsernames: string[];
}

interface MinecraftServerEvents extends ChatServerEvents {
	'game.death': {
		message: DeathMessage;
		server: ChatServer;
	};
}
export default class MinecraftServer extends EventEmitter<MinecraftServerEvents>
	implements ChatServer {
	private _textChannel: MinecraftTextChannel;
	private _identityCache: MinecraftIdentityCache;

	public readonly me: Readonly<MinecraftIdentity>;
	private _id: string;
	private _logReader: MinecraftLogClient;
	private _rcon: RconClient | null;
	private _identityService: IdentityService;
	private _knownBotUsernames: string[];

	constructor(options: MinecraftServerOptions) {
		super();
		({
			id: this._id,
			logClient: this._logReader,
			rcon: this._rcon,
			identityService: this._identityService,
			minecraftIdentityCache: this._identityCache,
			knownBotUsernames: this._knownBotUsernames,
		} = options);

		const { botName } = options;

		this._textChannel = new MinecraftTextChannel(this, this._rcon);

		this.me = new MinecraftIdentity(
			this,
			{ username: botName, uuid: 'bot-' + botName },
			true
		);

		this._logReader.on('chatMessage', async event => {
			const chatMessage = event.data;
			const identity = await this.getIdentityFromUsername(
				chatMessage.author
			);

			if (identity)
				this.emit(
					new CancellableEvent(
						'message',
						new MinecraftMessage(
							this._textChannel,
							identity,
							chatMessage.message
						)
					)
				);
		});

		this._logReader.on('logInOutMessage', async event => {
			const message = event.data;
			const identity = await this.getIdentityFromUsername(message.who);

			if (identity)
				this.emit(
					new CancellableEvent('presenceUpdate', {
						identity,
						joined: message.event === 'joined',
					})
				);
		});

		this._logReader.on('deathMessage', async event => {
			const message = event.data;

			if (!message.player) return; //Intentional game design

			const identity = await this._identityCache.addByName(
				message.player!
			);

			if (identity)
				this.emit(
					new CancellableEvent('game.death', {
						message: message,
						server: this,
					})
				);
		});
	}

	private async getIdentityFromUsername(username: string) {
		const userData = await this._identityCache.addByName(username);
		if (!userData) return null;
		return new MinecraftIdentity(
			this,
			userData,
			this._knownBotUsernames.includes(username)
		);
	}

	async getTextChannels() {
		return [this._textChannel];
	}

	async getAudioChannels() {
		return [];
	}

	async getTextChannel(id: string) {
		if (id === this._textChannel.id) {
			return this._textChannel;
		}

		return null;
	}

	getRcon() {
		return this._rcon;
	}

	async awaitConnected() {
		return this;
	}

	async getPrivateTextChannel(): Promise<null> {
		return null;
	}

	get id() {
		return this._id;
	}

	async connect() {
		this._logReader.start();
	}

	async disconnect() {
		this._logReader.stop();
		if (this._rcon) await this._rcon.disconnect();
	}

	get isConnected() {
		return this._logReader.isRunning;
	}

	async getIdentityById(id: string) {
		const userData = this._identityCache.getById(id);
		if (userData) return new MinecraftIdentity(this, userData, false);
		return null;
	}

	getIdentityService() {
		return this._identityService;
	}
}
