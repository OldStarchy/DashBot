import { Tail } from 'tail';
import MinecraftLogClient from './MinecraftLogClient';

interface MinecraftTailLogClientOptions {
	logFilePath: string;
}

export default class MinecraftTailLogClient extends MinecraftLogClient {
	private readonly _logFilePath: string;
	private _tail: Tail | null = null;
	public get isRunning() {
		return this._tail !== null;
	}

	constructor(options: MinecraftTailLogClientOptions) {
		super();
		this._logFilePath = options.logFilePath;
	}

	start() {
		if (this._tail === null) {
			this._tail = new Tail(this._logFilePath, {
				follow: true,
			});

			this._tail.on('line', (line) => {
				this.onLineReceived(line);
			});
		}

		this._tail!.watch();
	}

	stop() {
		this._tail?.unwatch();
		this._tail = null;
	}
}
