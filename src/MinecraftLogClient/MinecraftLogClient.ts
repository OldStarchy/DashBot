import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { ChatMessage } from './ChatMessage';
import { LogMessage } from './LogMessage';

export interface MinecraftLogClient {
	on(event: 'chatMessage', listener: (message: ChatMessage) => void): this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(event: string, listener: (...args: any[]) => void): this;
}

export interface MinecraftLogClientOptions {
	logger: Logger;
}

export abstract class MinecraftLogClient extends EventEmitter {
	protected readonly logger: Logger;

	constructor(options: MinecraftLogClientOptions) {
		super();
		this.logger = options.logger;
	}
	public abstract start(): void;
	public abstract stop(): void;

	public onLineReceived(line: string) {
		this.logger.info(`Minecraft Log: ${line}`);

		const message = LogMessage.parse(line);

		if (message != null && message instanceof ChatMessage) {
			this.emit('chatMessage', message);
		}
	}
}
