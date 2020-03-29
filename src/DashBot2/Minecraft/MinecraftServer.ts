import Rcon from 'modern-rcon';
import { MinecraftLogClient } from '../../MinecraftLogClient/MinecraftLogClient';
import Message from '../Message';
import { EventListener } from '../notebook';
import Person from '../Person';
import ChatServer from '../Server';
import MinecraftIdentityCache from './MinecraftIdentityCache';
import MinecraftMessage from './MinecraftMessage';
import MinecraftTextChannel from './MinecraftTextChannel';

export default class MinecraftServer implements ChatServer {
	private textChannel: MinecraftTextChannel;

	constructor(
		private logReader: MinecraftLogClient,
		private rcon: Rcon | null,
		private identityCache: MinecraftIdentityCache
	) {
		this.textChannel = new MinecraftTextChannel(this, this.rcon);
	}

	async getTextChannels() {
		return [this.textChannel];
	}

	async getAudioChannels() {
		return [];
	}

	on(event: 'message', listener: EventListener<[Message]>): void;
	on(event: string, listener: EventListener) {
		if (event === 'message') {
			this.logReader.on('chatMessage', chatMessage => {
				this.identityCache.add({ name: chatMessage.author });

				listener(
					new MinecraftMessage(
						this.textChannel,
						this.identityCache.getByName(chatMessage.author)!,
						chatMessage.message
					)
				);
			});
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
		await this.rcon?.connect();
	}

	async disconnect() {
		this.logReader.stop();
		await this.rcon?.disconnect();
	}

	getIdentityById(id: string) {
		return this.identityCache.getById(id);
	}
}
