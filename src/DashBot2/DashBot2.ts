import { Logger } from 'winston';
import parseArguments from '../util/parseArguments';
import Command from './Command';
import { Event, EventEmitter, EventHandler } from './Events';
import Message from './Message';
import ChatServer from './Server';

export class DashBot2 extends EventEmitter {
	private _commands: Record<string, Command> = {};
	private _startTime: number | null = null;
	private _stopTime: number | null = null;
	private _chatServers: ChatServer[] = [];

	constructor(private _logger: Logger) {
		super();
	}

	public addServer(chatServer: ChatServer) {
		this._chatServers.push(chatServer);
		chatServer.on('message', this.onMessage.bind(this));
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

		const text = message.textContent;
		try {
			if (text.startsWith('!')) {
				const parameters = parseArguments(text);

				const name = parameters.shift()!.substr(1);

				await this.runCommand(message, name, ...parameters);
			} else {
				this.emit(new Event('message', message));
			}
			// for (const action of this.actions) {
			// 	const result = await action.handle(message);

			// 	if (ActionResult.isHandled(result)) return;
			// }
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
	on(event: string, handler: EventHandler<any>): void {
		return super.on(event, handler);
	}
}
