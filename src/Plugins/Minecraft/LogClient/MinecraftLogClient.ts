import { Event, EventEmitter } from '../../../Events';
import ChatMessage from './ChatMessage';
import LogInOutMessage from './LogInOutMessage';
import LogMessageParser from './LogMessageParser';
import DeathMessage from './PlayerDeathMessage';

export interface MinecraftLogClientEvents {
	chatMessage: ChatMessage;
	logInOutMessage: LogInOutMessage;
	deathMessage: DeathMessage;
}

export default abstract class MinecraftLogClient extends EventEmitter<
	MinecraftLogClientEvents
> {
	constructor() {
		super();
	}
	public abstract start(): void;
	public abstract stop(): void;
	public abstract get isRunning(): boolean;

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
