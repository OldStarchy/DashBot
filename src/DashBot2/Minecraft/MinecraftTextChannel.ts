import Rcon from 'modern-rcon';
import { RconChat } from '../../Rcon/RconChat';
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

	getServer() {
		return this._server;
	}

	canSend() {
		return this._rcon !== null;
	}

	canReceive() {
		return true;
	}

	getSupportsReactions() {
		return false;
	}

	async sendText(message: string) {
		if (this._rcon) {
			//TODO: "DashBot" magic variable
			const chat = new RconChat(this._rcon, 'DashBot');
			await chat.broadcast(message);
		}
	}
}
