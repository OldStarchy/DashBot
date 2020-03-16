import { EventEmitter } from 'events';
import { ChatMessage } from './ChatMessage';

export interface MinecraftLogClient {
	on(event: 'chatMessage', listener: (message: ChatMessage) => void): this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(event: string, listener: (...args: any[]) => void): this;
}

export abstract class MinecraftLogClient extends EventEmitter {
	public abstract start(): void;
	public abstract stop(): void;
}
