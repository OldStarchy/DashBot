import { Logger } from 'winston';
import ChatServer, { PresenceUpdateEventData } from './ChatServer/ChatServer';
import Message from './ChatServer/Message';
import Command from './Command';
import { CancellableEvent, Event, EventEmitter, EventHandler } from './Events';
import parseArguments from './util/parseArguments';

export interface BeforeRunCommandData {
	message: Message | null;
	name: string;
	args: string[];
}

export default class DashBot extends EventEmitter {
	private _commands: Record<string, Command> = {};
	private _startTime: number | null = null;
	private _stopTime: number | null = null;
	private _chatServers: ChatServer[] = [];

	constructor(public readonly name: string, private _logger: Logger) {
		super();

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const bot = this;
		class DisconnectCommand implements Command {
			async run() {
				//TODO: Check for admin or something
				await bot.disconnect();
				process.exit(0);
			}
		}
		this.registerCommand('disconnect', new DisconnectCommand());
	}

	public addServer(chatServer: ChatServer) {
		this._chatServers.push(chatServer);

		// TODO: Make this better
		chatServer.on('message', this.onMessage.bind(this));
		chatServer.on('presenceUpdate', e => {
			this.emit(e);
		});
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
					this._logger.error("Couldn't connect to server");
				}
			})
		);
		this._startTime = Date.now();
		if (connections > 0) {
			this.emit(new CancellableEvent('connected', undefined));
		}
	}

	public async disconnect() {
		await Promise.all(
			this._chatServers.map(async server => {
				try {
					await server.disconnect();
					this._stopTime = Date.now();
				} catch (e) {
					this._logger.error("Couldn't disconnect from server");
				}
			})
		);
		this.emit(new CancellableEvent('disconnected', undefined));
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

	registerCommand(key: string, command: Command) {
		this._commands[key] = command;
	}

	private async onMessage(event: Event<Message>) {
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
			this._logger.error(
				`Message "${message.textContent}" caused an error`
			);
			if (e instanceof Error) {
				this._logger.error(e.message);
			}
			await message.channel.sendText('Something broke :poop:');
		}
	}

	async runCommand(message: Message | null, name: string, ...args: string[]) {
		if (this._commands[name]) {
			const event = this.emit(
				new Event<BeforeRunCommandData>('beforeRunCommand', {
					message,
					name,
					args,
				})
			);

			if (event.isCancelled()) {
				return;
			}

			await this._commands[name].run(message, name, ...args);
		}
	}

	on<TEvent extends keyof DashBotEvents>(
		event: TEvent,
		handler: EventHandler<DashBotEvents[TEvent]>
	): void;
	on(event: string, handler: EventHandler<any>): void {
		return super.on(event, handler);
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
