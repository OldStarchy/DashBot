import { Event, EventEmitter, EventHandler } from '../../../Events';
import ChatMessage from './ChatMessage';
import LogInOutMessage from './LogInOutMessage';
import LogMessageParser from './LogMessageParser';
import DeathMessage from './PlayerDeathMessage';

export default interface MinecraftLogClient {
	on(event: 'chatMessage', handler: EventHandler<ChatMessage>): this;
	on(event: 'logInOutMessage', handler: EventHandler<LogInOutMessage>): this;
	on(event: 'deathMessage', handler: EventHandler<DeathMessage>): this;
}

export default abstract class MinecraftLogClient extends EventEmitter {
	constructor() {
		super();
	}
	public abstract start(): void;
	public abstract stop(): void;

	public onLineReceived(line: string) {
		const message = LogMessageParser.parse(line);

		if (message !== null) {
			if (message instanceof ChatMessage) {
				this.emit(new Event('chatMessage', message));
			} else if (message instanceof LogInOutMessage) {
				this.emit(new Event('logInOutMessage', message));
			} else if (message instanceof DeathMessage) {
				this.emit(new Event('deathMessage', message));
			}
		}
	}
}
