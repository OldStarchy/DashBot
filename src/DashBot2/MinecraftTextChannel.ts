import Rcon from 'modern-rcon';
import { RconChat } from '../Rcon/RconChat';
import MinecraftServer from './MinecraftServer';
import TextChannel from './TextChannel';

export default class MinecraftTextChannel implements TextChannel {
	constructor(private server: MinecraftServer, private rcon: Rcon) {}

	canSend() {
		return true;
	}
	canReceive() {
		return true;
	}

	async sendText(message: string) {
		//TODO: "DashBot" magic variable
		const chat = new RconChat(this.rcon, 'DashBot');
		await chat.broadcast(message);
	}

	getName() {
		return 'In-game Chat';
	}

	getServer() {
		return this.server;
	}
}
