import { Logger } from 'winston';
import parseArguments from '../util/parseArguments';
import Command from './Command';
import { Event, EventEmitter, EventHandler } from './Events';
import Message from './Message';
import ChatServer from './Server';

export class DashBot2 extends EventEmitter {
	private commands: Record<string, Command> = {};
	private startTime: number | null = null;
	private stopTime: number | null = null;

	constructor(private logger: Logger, private chatServers: ChatServer[]) {
		super();

		for (const chatServer of this.chatServers) {
			chatServer.on('message', this.onMessage.bind(this));
		}
	}

	public async connect() {
		for (const server of this.chatServers) {
			try {
				await server.connect();
				this.startTime = Date.now();
			} catch (e) {
				this.logger.error("Couldn't connect to server");
			}
		}
	}

	public async disconnect() {
		for (const server of this.chatServers) {
			try {
				await server.disconnect();
				this.stopTime = Date.now();
			} catch (e) {
				this.logger.error("Couldn't disconnect to server");
			}
		}
	}

	public getUptime() {
		if (this.startTime !== null) {
			if (this.stopTime !== null) {
				return this.stopTime - this.startTime;
			}

			return Date.now() - this.startTime;
		}

		return 0;
	}

	registerCommand(key: string, command: Command) {
		this.commands[key] = command;
	}

	private async onMessage(message: Message) {
		if (message.getAuthor().getIsBot()) {
			return;
		}

		const text = message.getTextContent();
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
			this.logger.error(
				`Message "${message.getTextContent()}" caused an error`
			);
			this.logger.error(e);
			await message.getChannel().sendText('Something broke :poop:');
		}
	}

	async runCommand(message: Message | null, name: string, ...args: string[]) {
		if (this.commands[name]) {
			await this.commands[name].run(message, name, ...args);
		}
	}

	on(event: 'message', handler: EventHandler<Message>): void;
	on(event: string, handler: EventHandler<any>): void {
		return super.on(event, handler);
	}
}
