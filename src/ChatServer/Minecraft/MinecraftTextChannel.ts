import Rcon from 'modern-rcon';
import RconChat from '../../Rcon/RconChat';
import TextChannel from '../TextChannel';
import MinecraftServer from './MinecraftServer';

export default class MinecraftTextChannel implements TextChannel {
	constructor(
		private _server: MinecraftServer,
		private _rcon: Rcon | null = null
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
			//TODO: "DashBot" magic variable
			const chat = new RconChat(this._rcon, this._server.me.username);
			await chat.broadcast(message);
		}
	}
}
