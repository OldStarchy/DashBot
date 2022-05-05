import TextChannel from '../../../ChatServer/TextChannel';
import RconClient from '../Rcon/RconClient';
import MinecraftServer from './MinecraftServer';

export default class MinecraftTextChannel implements TextChannel {
	constructor(
		private _server: MinecraftServer,
		private _rcon: RconClient | null = null
	) {}

	get id() {
		return '0';
	}

	get name() {
		return 'In-game Chat';
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

	async sendText(message: string) {
		if (this._rcon) {
			await this._rcon.broadcast(message, this._server.me.username);
		}
	}

	async sendTyping() {
		return;
	}
}
