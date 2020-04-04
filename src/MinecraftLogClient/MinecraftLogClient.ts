import { EventEmitter } from 'events';
import { Logger } from 'winston';
import ChatMessage from './ChatMessage';
import LogInOutMessage from './LogInOutMessage';
import LogMessageParser from './LogMessageParser';

export default interface MinecraftLogClient {
	on(event: 'chatMessage', listener: (message: ChatMessage) => void): this;
	on(
		event: 'logInOutMessage',
		listener: (message: LogInOutMessage) => void
	): this;
	on(event: string, listener: (...args: any[]) => void): this;
}

export interface MinecraftLogClientOptions {
	logger: Logger;
}

export default abstract class MinecraftLogClient extends EventEmitter {
	protected readonly logger: Logger;

	constructor(options: MinecraftLogClientOptions) {
		super();
		this.logger = options.logger;
	}
	public abstract start(): void;
	public abstract stop(): void;

	public onLineReceived(line: string) {
		this.logger.info(`Minecraft Log: ${line}`);

		const message = LogMessageParser.parse(line);

		if (message !== null) {
			if (message instanceof ChatMessage) {
				this.emit('chatMessage', message);
			} else if (message instanceof LogInOutMessage) {
				this.emit('logInOutMessage', message);
			}
		}
	}
}
