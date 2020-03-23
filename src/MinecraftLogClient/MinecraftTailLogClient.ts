import { Tail } from 'tail';
import {
	MinecraftLogClient,
	MinecraftLogClientOptions,
} from './MinecraftLogClient';

interface MinecraftTailLogClientOptions extends MinecraftLogClientOptions {
	logFilePath: string;
}

export class MinecraftTailLogClient extends MinecraftLogClient {
	private readonly logFilePath: string;
	private tail: Tail | null = null;

	constructor(options: MinecraftTailLogClientOptions) {
		super(options);
		this.logFilePath = options.logFilePath;
	}

	start() {
		if (this.tail === null) {
			this.tail = new Tail(this.logFilePath, {
				follow: true,
			});

			this.tail.on('line', line => {
				this.onLineReceived(line);
			});
		}

		this.tail!.watch();
	}

	stop() {
		this.tail?.unwatch();
	}
}
