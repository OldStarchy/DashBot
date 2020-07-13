import mineflayer from 'mineflayer';
import winston from 'winston';
import ChatServer, {
	PresenceUpdateEventData,
} from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';
import IdentityService from '../../../ChatServer/IdentityService';
import Message from '../../../ChatServer/Message';
import { CancellableEvent, EventHandler } from '../../../Events';
import deferred, { Deferred } from '../../../util/deferred';
import MineflayerBroadcastChannel from './MineflayerBroadcastChannel';
import MineflayerIdentity from './MineflayerIdentity';
import MineflayerMessage from './MineflayerMessage';
import MineflayerTextChannel from './MineflayerTextChannel';
import MineflayerWhisperChannel from './MineflayerWhisperChannel';

export interface MineflayerOptions {
	host: string;
	port: number;
	username: string;
	password?: string;

	identityService: IdentityService;
}

export default class MineflayerClient
	implements ChatServer<MineflayerIdentity, MineflayerTextChannel> {
	private _loggedIn: Deferred<this>;
	private _identityService: IdentityService;

	get id() {
		return this.options.username;
	}

	get me(): Readonly<MineflayerIdentity> {
		throw new Error('Method not implemented.');
	}

	private bot: mineflayer.Bot | null = null;

	constructor(private options: MineflayerOptions) {
		this._identityService = options.identityService;
		this._loggedIn = deferred<this>();
	}

	async connect(): Promise<void> {
		if (this.bot) {
			return;
		}

		this.bot = mineflayer.createBot({
			host: this.options.host,
			port: this.options.port,
			username: this.options.username,
			password: this.options.password,
		});

		this.awaitConnected().then(() => {
			const USERNAME_REGEX = '(?:\\(.+\\)|\\[.+\\]|.)*?(\\w+)';
			this.bot!.chatPatterns = [
				{
					pattern: new RegExp(
						`^${USERNAME_REGEX} whispers(?: to you)?:? (.*)$`
					),
					type: 'whisper',
					description: 'Vanilla whisper',
				},
				{
					pattern: new RegExp(
						`^\\[${USERNAME_REGEX} -> \\w+\\s?\\] (.*)$`
					),
					type: 'whisper',
					description: 'Essentials whisper',
				},
				{
					pattern: new RegExp(`^\\<${USERNAME_REGEX}\\>\\s(.*)$`),
					type: 'chat',
					description: 'Universal chat',
				},
			];
		});

		this.bot.on('spawn', () => {
			winston.info('Bot Spawned in minecraft');
			this.bot!.chat('I have logged in');
			this._loggedIn.resolve(this);
		});
		this.bot.on('kicked', () => {
			winston.info("I've been kicked");
		});

		this.bot.on('error', err => {
			winston.error(err.message);
		});

		this.bot.on('game', () => {
			winston.info('"game" event from mineflayer');
		});
	}

	public getBot() {
		return this.bot;
	}

	async disconnect(): Promise<void> {
		this.bot?.end();
		this.bot = null;
		this._loggedIn = deferred<this>();
	}

	async getAudioChannels() {
		return [];
	}

	private broadcastChannel = new MineflayerBroadcastChannel(
		this,
		'0',
		'Broadcast Chat'
	);

	async getTextChannels(): Promise<MineflayerTextChannel[]> {
		if (!this.bot) {
			return [];
		}

		const players = this.bot.players;
		const privateChats = Object.keys(players)
			.sort()
			.filter(username => username !== this.bot!.username)
			.map(username => this.makeWhisperChannel(username));

		return [this.broadcastChannel, ...privateChats];
	}

	private makeWhisperChannel(username: string) {
		return new MineflayerWhisperChannel(
			this,
			username,
			`Private chat with ${username}`,
			username
		);
	}

	async getTextChannel(id: string): Promise<MineflayerTextChannel | null> {
		if (!this.bot) {
			return null;
		}

		if (id === '0') return this.broadcastChannel;

		if (this.bot.players[id]) return this.makeWhisperChannel(id);

		return null;
	}

	async getPrivateTextChannel(
		person: Identity
	): Promise<MineflayerTextChannel | null> {
		//TODO: Get their minecraft username
		return this.makeWhisperChannel(person.username);
	}

	private makeIdentity(username: string): MineflayerIdentity | null;
	private makeIdentity(player: mineflayer.Player): MineflayerIdentity | null;
	private makeIdentity(
		usernameOrPlayer: mineflayer.Player | string
	): MineflayerIdentity | null {
		if (!this.bot) return null;

		if (typeof usernameOrPlayer === 'string')
			return new MineflayerIdentity(
				this,
				usernameOrPlayer,
				(this.bot.players[usernameOrPlayer] as any).uuid,
				usernameOrPlayer === this.bot.username
			);
		else {
			return new MineflayerIdentity(
				this,
				usernameOrPlayer.username,
				(usernameOrPlayer as any).uuid,
				usernameOrPlayer.username === this.bot.username
			);
		}
	}
	async getIdentityById(id: string): Promise<MineflayerIdentity | null> {
		if (!this.bot) return null;

		const player = Object.values(this.bot.players).find(
			player => (player as any).uuid === id
		);

		if (player) {
			return this.makeIdentity(player);
		}

		return null;
	}

	on(event: 'message', handler: EventHandler<Message>): void;
	on(
		event: 'presenceUpdate',
		handler: EventHandler<PresenceUpdateEventData>
	): void;
	on(event: string, handler: EventHandler<unknown>): void;
	on(event: any, handler: any) {
		if (!this.bot) return;

		switch (event) {
			case 'message':
				this.bot.on(
					'chat',
					(
						username: string,
						message: string
						// _translate: string | null,
						// _jsonMsg: string,
						// _matches: string[] | null
					) => {
						handler(
							new CancellableEvent<Message>(
								'message',
								new MineflayerMessage(
									this.broadcastChannel,
									this.makeIdentity(username)!,
									message
								)
							)
						);
					}
				);
				this.bot.on(
					'whisper',
					(
						username: string,
						message: string
						// _translate: string | null,
						// _jsonMsg: string,
						// _matches: string[] | null
					) => {
						handler(
							new CancellableEvent<Message>(
								'message',
								new MineflayerMessage(
									this.makeWhisperChannel(username),
									this.makeIdentity(username)!,
									message
								)
							)
						);
					}
				);
		}
	}

	getIdentityService(): IdentityService {
		return this._identityService;
	}

	async awaitConnected(): Promise<this> {
		return this._loggedIn;
	}
}
