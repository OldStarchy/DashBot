import Rcon from 'modern-rcon';
import { MinecraftLogClient } from '../MinecraftLogClient/MinecraftLogClient';
import IdentityService from './IdentityService';
import MinecraftTextChannel from './MinecraftTextChannel';
import { EventListener } from './notebook';
import Person from './Person';
import ChatServer from './Server';
import TextChannel from './TextChannel';

export default class MinecraftServer implements ChatServer {
	private textChannel: TextChannel;

	constructor(
		private logReader: MinecraftLogClient,
		private rcon: Rcon,
		private identityService: IdentityService
	) {
		//TODO: Maybe move "new" to caller
		this.textChannel = new MinecraftTextChannel(this, rcon);
	}

	async getTextChannels() {
		return [this.textChannel];
	}

	async getAudioChannels() {
		return [];
	}

	on(event: string, listener: EventListener) {
		if (event === 'message') {
			this.logReader.on('chatMessage', listener);
		}
		//TODO: other events
	}

	getPrivateChatChannel(person: Person) {
		//TODO: this
		return null;
	}

	getName() {
		return 'Minecraft';
	}

	async connect() {
		this.logReader.start();
		await this.rcon.connect();
	}

	async disconnect() {
		this.logReader.stop();
		await this.rcon.disconnect();
	}
}
