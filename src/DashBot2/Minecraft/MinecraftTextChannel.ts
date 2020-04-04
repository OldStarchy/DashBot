import Rcon from 'modern-rcon';
import { RconChat } from '../../Rcon/RconChat';
import TextChannel from '../TextChannel';
import MinecraftServer from './MinecraftServer';

export default class MinecraftTextChannel implements TextChannel {
	constructor(
		private server: MinecraftServer,
		private rcon: Rcon | null = null
	) {}

	getId() {
		return '0';
	}

	getName() {
		return 'In-game Chat';
	}

	getServer() {
		return this.server;
	}

	canSend() {
		return this.rcon !== null;
	}

	canReceive() {
		return true;
	}

	getSupportsReactions() {
		return false;
	}

	async sendText(message: string) {
		if (this.rcon) {
			//TODO: "DashBot" magic variable
			const chat = new RconChat(this.rcon, 'DashBot');
			await chat.broadcast(message);
		}
	}
}
