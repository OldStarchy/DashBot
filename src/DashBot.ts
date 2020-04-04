import { Logger } from 'winston';
import ChatServer from './ChatServer/ChatServer';
import Identity from './ChatServer/Identity';
import Message from './ChatServer/Message';
import Command from './Command';
import { Event, EventEmitter, EventHandler } from './Events';
import parseArguments from './util/parseArguments';

export default class DashBot extends EventEmitter {
	private _commands: Record<string, Command> = {};
	private _startTime: number | null = null;
	private _stopTime: number | null = null;
	private _chatServers: ChatServer[] = [];

	constructor(private _logger: Logger) {
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
		chatServer.on('message', this.onMessage.bind(this));
		chatServer.on('presenceUpdate', (identity, joined) => {
			this.emit(
				new Event('presenceUpdate', {
					identity,
					joined,
				})
			);
		});
	}

	public async connect() {
		for (const server of this._chatServers) {
			try {
				await server.connect();
				this._startTime = Date.now();
			} catch (e) {
				this._logger.error("Couldn't connect to server");
			}
		}
	}

	public async disconnect() {
		for (const server of this._chatServers) {
			try {
				await server.disconnect();
				this._stopTime = Date.now();
			} catch (e) {
				this._logger.error("Couldn't disconnect to server");
			}
		}
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

	private async onMessage(message: Message) {
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
				this.emit(new Event('message', message));
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
			await this._commands[name].run(message, name, ...args);
		}
	}

	on(event: 'message', handler: EventHandler<Message>): void;
	on(
		event: 'presenceUpdate',
		handler: EventHandler<{ identity: Identity; joined: boolean }>
	): void;
	on(event: string, handler: EventHandler<any>): void {
		return super.on(event, handler);
	}
}
