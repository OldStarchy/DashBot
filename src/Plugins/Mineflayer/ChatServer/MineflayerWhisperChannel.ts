import MineflayerServer from './MineflayerClient';
import MineflayerTextChannel from './MineflayerTextChannel';

export default class MineflayerWhisperChannel extends MineflayerTextChannel {
	constructor(
		_server: MineflayerServer,
		public readonly id: string,
		public readonly name: string,
		public readonly targetPlayerName: string
	) {
		super(_server);
	}

	get canSend() {
		return true;
	}

	get canReceive() {
		return true;
	}

	get server() {
		return this._server;
	}

	get supportsReactions() {
		return false;
	}

	async sendText(message: string): Promise<void> {
		this._server.getBot()?.whisper(this.targetPlayerName, message);
	}

	async sendTyping(): Promise<void> {
		return;
	}
}
