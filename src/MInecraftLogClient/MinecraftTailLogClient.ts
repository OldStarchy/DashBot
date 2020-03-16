import { Tail } from 'tail';
import { ChatMessage } from './ChatMessage';
import { LogMessage } from './LogMessage';
import { MinecraftLogClient } from './MinecraftLogClient';

interface MinecraftTailLogClientOptions {
	logFilePath: string;
}

export class MinecraftTailLogClient extends MinecraftLogClient {
	private readonly logFilePath: string;
	private tail: Tail | null = null;

	constructor({ logFilePath }: MinecraftTailLogClientOptions) {
		super();
		this.logFilePath = logFilePath;
	}

	start() {
		if (this.tail === null) {
			this.tail = new Tail(this.logFilePath, {
				follow: true,
			});

			this.tail.on('line', line => {
				this.onLine(line);
			});
		}

		this.tail!.watch();
	}

	stop() {
		this.tail?.unwatch();
	}

	private onLine(line: string) {
		const message = LogMessage.parse(line);

		if (message instanceof ChatMessage) {
			this.emit('chatMessage', message);
		}
	}
}
