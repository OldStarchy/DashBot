import { Tail } from 'tail';
import {
	MinecraftLogClient,
	MinecraftLogClientOptions,
} from './MinecraftLogClient';

interface MinecraftTailLogClientOptions extends MinecraftLogClientOptions {
	logFilePath: string;
}

export class MinecraftTailLogClient extends MinecraftLogClient {
	private readonly _logFilePath: string;
	private _tail: Tail | null = null;

	constructor(options: MinecraftTailLogClientOptions) {
		super(options);
		this._logFilePath = options.logFilePath;
	}

	start() {
		if (this._tail === null) {
			this._tail = new Tail(this._logFilePath, {
				follow: true,
			});

			this._tail.on('line', line => {
				this.onLineReceived(line);
			});
		}

		this._tail!.watch();
	}

	stop() {
		this._tail?.unwatch();
	}
}
