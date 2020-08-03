import { DateTime } from 'luxon';
import MinecraftData from 'minecraft-data';
import mineflayer from 'mineflayer';
import { Entity } from 'prismarine-entity';
import { Vec3 } from 'vec3';
import winston from 'winston';
import ChatServer, { ChatServerEvents } from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';
import IdentityService from '../../../ChatServer/IdentityService';
import { CommandSet } from '../../../Command';
import { CancellableEvent, EventEmitter } from '../../../Events';
import MojangApiClient from '../../../MojangApiClient';
import deferred, { Deferred } from '../../../util/deferred';
import parseArguments from '../../../util/parseArguments';
import FollowBehaviour from '../behaviours/FollowBehaviour';
import AttackCommand from '../commands/AttackCommand';
import DropAllCommand from '../commands/DropAllCommand';
import FishCommand from '../commands/FishCommand';
import FollowCommand from '../commands/FollowCommand';
import StopCommand from '../commands/StopCommand';
import StopPleaseCommand from '../commands/StopPleaseCommand';
import blockMarch from '../util/blockMarch';
import BusyLock from '../util/BusyLock';
import { deltaYaw } from '../util/deltaYaw';
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

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface MineflayerBehaviours {}
}

type MineflayerClientEvents = ChatServerEvents;

export default class MineflayerClient
	extends EventEmitter<MineflayerClientEvents>
	implements ChatServer {
	private _loggedIn: Deferred<this>;
	private _identityService: IdentityService;
	private _behaviours: Partial<MineflayerBehaviours>;
	private _busyLock: BusyLock = new BusyLock();
	private _mcData: MinecraftData.IndexedData | null = null;

	readonly commands = new CommandSet();

	get id() {
		return this.options.username;
	}

	get me(): Readonly<MineflayerIdentity> {
		throw new Error('Method not implemented.');
	}

	get isConnected() {
		return this.bot !== null;
	}

	private bot: mineflayer.Bot | null = null;

	private boundOnLogin = this.onLogin.bind(this);
	private boundOnKicked = this.onKicked.bind(this);
	private boundOnError = this.onError.bind(this);
	private boundOnChat = this.onChat.bind(this);
	private boundOnWhisper = this.onWhisper.bind(this);

	constructor(private options: MineflayerOptions) {
		super();
		this._identityService = options.identityService;
		this._loggedIn = deferred<this>();

		this._behaviours = {};

		this.init();
	}

	private init() {
		new FollowBehaviour({}, { client: this });

		this.commands.add(new FollowCommand(this));
		this.commands.add(new AttackCommand(this));
		this.commands.add(new FishCommand(this));
		this.commands.add(new DropAllCommand(this));
		this.commands.add(new StopCommand(this));
		this.commands.add(new StopPleaseCommand(this));

		this.on('message', async e => {
			const message = e.data;
			if (message.author.isBot) return;
			const textContent = message.textContent;

			try {
				if (textContent.startsWith('!')) {
					const parameters = parseArguments(textContent);

					const name = parameters.shift()!.substr(1);

					await this.commands.run(message, name, parameters);
				}
			} catch (e) {
				winston.error(
					`Message "${message.textContent}" caused an error`
				);
				if (e instanceof Error) {
					winston.error(e.message);
				}
				await message.channel.sendText('Something broke :poop:');
			}
		});
	}
	/**
	 * Sets a "BusyLock" on the bot. Basically asking if the bot is busy.
	 *
	 * If successful, a "release" function is returned that can release the lock.
	 *
	 * If setBusyLock is called while locked, it will return false unless the new lock has higher priority.
	 *
	 * If the new lock has higher priority, the old locks `cancelled` function will be called.
	 *
	 * ```ts
	 * // Dance 100 times but stop if something else comes up
	 * const danceLock = bot.getBusyLock(0);
	 * if (danceLock) {
	 * 	let dance = 100;
	 *
	 * 	while (!danceLock.cancelled && dance-- > 0) {
	 * 		await dance();
	 * 	}
	 *
	 * 	danceLock.release();
	 * }
	 * ```
	 */
	getBusyLock(priority: number) {
		return this._busyLock.getBusyLock(priority);
	}

	isBusy(priority?: number) {
		return this._busyLock.isBusy(priority);
	}

	stop(priority: number) {
		return this._busyLock.stop(priority);
	}

	get behaviours(): Readonly<Partial<MineflayerBehaviours>> {
		return { ...this._behaviours };
	}

	setBehaviour<TBehaviourName extends keyof MineflayerBehaviours>(
		name: TBehaviourName,
		behaviour: MineflayerBehaviours[TBehaviourName]
	) {
		if (this._behaviours[name])
			throw new Error(`Behaviour ${name} defined twice`);
		this._behaviours[name] = behaviour;
	}

	private _nextAttackTime = 0;
	async attack(target: Entity) {
		if (this._nextAttackTime > DateTime.utc().valueOf()) return false;

		const bot = this.getBot();
		if (!bot) return false;

		const pos = target.position;
		const myPos = bot.player.entity.position;

		const distance = myPos.xzDistanceTo(pos);

		if (distance > 4) {
			return;
		}

		let blocked = false;
		blockMarch(
			myPos.offset(0, 1.26, 0),
			pos.offset(0, 1.26, 0),
			blockPos => {
				const block = bot.blockAt(blockPos);
				if (block && block.boundingBox !== 'empty') {
					blocked = true;
					return true;
				}
				return false;
			}
		);

		if (blocked) {
			return false;
		}

		this._nextAttackTime =
			DateTime.utc().valueOf() + Math.round(Math.random() * 300 + 100);

		const hitChance = 1.5 / distance;

		await new Promise<boolean>(s => {
			bot.lookAt(
				new Vec3(pos.x, pos.y + target.height, pos.z),
				false,
				() => {
					const delta = pos.minus(
						myPos.offset(0, bot.entity.height, 0)
					);
					const yaw = Math.atan2(-delta.x, -delta.z);

					if (Math.abs(deltaYaw(bot.entity.yaw, yaw)) < 0.01) {
						bot?.swingArm();
						if (Math.random() < hitChance) {
							bot?.attack(target);
							return s(true);
						}
					}
					return s(false);
				}
			);
		});
	}

	getMcData() {
		return this._mcData;
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

		this.bindEvents();
	}

	private bindEvents() {
		if (!this.bot) return;
		this.bot.on('login', this.boundOnLogin);
		this.bot.on('kicked', this.boundOnKicked);
		this.bot.on('error', this.boundOnError);
		this.bot.on('chat', this.boundOnChat);
		this.bot.on('whisper', this.boundOnWhisper);
	}

	private unbindEvents() {
		if (!this.bot) return;
		this.bot.off('login', this.boundOnLogin);
		this.bot.off('kicked', this.boundOnKicked);
		this.bot.off('error', this.boundOnError);
		this.bot.off('chat', this.boundOnChat);
		this.bot.off('whisper', this.boundOnWhisper);
	}

	private onLogin() {
		winston.info('Bot logged in to minecraft');
		this.bot!.chat('I have logged in');

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		this._mcData = require('minecraft-data')(
			this.bot!.version
		) as MinecraftData.IndexedData;

		this._loggedIn.resolve(this);
	}
	private onKicked() {
		winston.info("I've been kicked");
		this.disconnect();
	}

	private onError(err: Error) {
		winston.error(err.message);
		this.disconnect();
	}

	private async onChat(
		username: string,
		message: string
		// _translate: string | null,
		// _jsonMsg: string,
		// _matches: string[] | null
	) {
		if (!this._loggedIn) return;

		this.emit(
			new CancellableEvent(
				'message',
				new MineflayerMessage(
					this.broadcastChannel,
					(await this.makeIdentity(username))!,
					message
				)
			)
		);
	}

	private async onWhisper(
		username: string,
		message: string
		// _translate: string | null,
		// _jsonMsg: string,
		// _matches: string[] | null
	) {
		if (!this._loggedIn) return;

		this.emit(
			new CancellableEvent(
				'message',
				new MineflayerMessage(
					this.makeWhisperChannel(username),
					(await this.makeIdentity(username))!,
					message
				)
			)
		);
	}

	public getBot() {
		return this.bot;
	}

	async disconnect(): Promise<void> {
		this._busyLock.stop(Infinity);
		this.unbindEvents();
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

	private async makeIdentity(username: string): Promise<MineflayerIdentity>;
	private async makeIdentity(
		player: mineflayer.Player
	): Promise<MineflayerIdentity>;
	private async makeIdentity(
		usernameOrPlayer: mineflayer.Player | string
	): Promise<MineflayerIdentity> {
		const bot = this.bot;
		if (!bot) throw new Error('Not logged in');

		const mojang = new MojangApiClient();

		if (typeof usernameOrPlayer === 'string')
			return new MineflayerIdentity(
				this,
				usernameOrPlayer,
				(await mojang.getUuidFromUsername(usernameOrPlayer))?.id ??
					usernameOrPlayer,
				usernameOrPlayer === bot.username
			);
		else {
			return new MineflayerIdentity(
				this,
				usernameOrPlayer.username,
				(await mojang.getUuidFromUsername(usernameOrPlayer.username))
					?.id ?? usernameOrPlayer.username,
				usernameOrPlayer.username === bot.username
			);
		}
	}
	async getIdentityById(id: string): Promise<MineflayerIdentity | null> {
		const bot = this.bot;
		if (!bot) throw new Error('Not logged in');

		const player = Object.values(bot.players).find(
			player => (player as any).uuid === id
		);

		if (player) {
			return this.makeIdentity(player);
		}

		return null;
	}

	getIdentityService(): IdentityService {
		return this._identityService;
	}

	async awaitConnected(): Promise<this> {
		return this._loggedIn;
	}
}
