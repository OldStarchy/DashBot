import TextChannel from '../../../ChatServer/TextChannel';
import MineflayerServer from './MineflayerClient';

export default abstract class MineflayerTextChannel implements TextChannel {
	constructor(protected _server: MineflayerServer) {}

	abstract get id(): string;
	abstract get name(): string;

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

	abstract async sendText(message: string): Promise<void>;
}
