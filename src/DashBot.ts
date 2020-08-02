import winston from 'winston';
import ChatServer, { PresenceUpdateEventData } from './ChatServer/ChatServer';
import Message from './ChatServer/Message';
import Command, { CommandSet } from './Command';
import { Event, EventEmitter, EventForEmitter } from './Events';
import MinecraftServer from './Plugins/Minecraft/ChatServer/MinecraftServer';
import parseArguments from './util/parseArguments';

export interface BeforeRunCommandData {
	message: Message | null;
	name: string;
	args: string[];
}

export default class DashBot extends EventEmitter<DashBotEvents> {
	private _startTime: number | null = null;
	private _stopTime: number | null = null;
	private _chatServers: ChatServer[] = [];

	readonly commands = new CommandSet();

	constructor(public readonly name: string) {
		super();

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const bot = this;
		class DisconnectCommand extends Command {
			readonly name = 'disconnect';
			readonly description = 'Shuts down dasbhot';
			async run(message: Message) {
				winston.warn(
					`Shutdown command invoked by ${message.author.username} in ${message.channel.name} in ${message.channel.server.id}`
				);
				//TODO: Check for admin or something
				await bot.disconnect();
				process.exit(0);
			}
		}

		this.commands.add(new DisconnectCommand());
	}

	public addServer(chatServer: ChatServer) {
		this._chatServers.push(chatServer);

		// TODO: Make this better
		chatServer.on('message', this.onMessage.bind(this));
		chatServer.on('presenceUpdate', e => {
			this.emit(e);
		});
		if (chatServer instanceof MinecraftServer)
			chatServer.on('game.death', e => {
				this.emit(e);
			});
	}

	public async connect() {
		let connections = 0;
		await Promise.all(
			this._chatServers.map(async server => {
				try {
					await server.connect();
					connections++;
				} catch (e) {
					winston.error("Couldn't connect to server");
				}
			})
		);
		this._startTime = Date.now();
		if (connections > 0) {
			this.emit(new Event('connected', undefined));
		}
	}

	public async disconnect() {
		await Promise.all(
			this._chatServers.map(async server => {
				try {
					await server.disconnect();
					this._stopTime = Date.now();
				} catch (e) {
					winston.error("Couldn't disconnect from server");
				}
			})
		);
		this.emit(new Event('disconnected', undefined));
	}

	public getUptime() {
		if (this._startTime !== null) {
			if (this._stopTime !== null) {
				return this._stopTime - this._startTime;
			}

			return Date.now() - this._startTime;
		}

		return 0;
	}

	private async onMessage(event: EventForEmitter<ChatServer, 'message'>) {
		const message = event.data;
		if (message.author.isBot) {
			return;
		}

		const textContent = message.textContent;
		try {
			if (textContent.startsWith('!')) {
				const parameters = parseArguments(textContent);

				const name = parameters.shift()!.substr(1);

				await this.runCommand(message, name, ...parameters);
			} else {
				await this.emitAsync(event);
			}
		} catch (e) {
			winston.error(`Message "${message.textContent}" caused an error`);
			if (e instanceof Error) {
				winston.error(e.message);
			}
			await message.channel.sendText('Something broke :poop:');
		}
	}

	async runCommand(message: Message, commandName: string, ...args: string[]) {
		const event = this.emit(
			new Event('beforeRunCommand', {
				message,
				name: commandName,
				args,
			})
		);

		if (event.isCancelled()) {
			return;
		}

		await this.commands.run(message, commandName, args);
	}
}

declare global {
	interface DashBotEvents {
		beforeRunCommand: BeforeRunCommandData;
		disconnected: undefined;
		connected: undefined;
		message: Message;
		presenceUpdate: PresenceUpdateEventData;
	}
}
