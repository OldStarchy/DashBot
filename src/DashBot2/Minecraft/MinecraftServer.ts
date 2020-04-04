import Rcon from 'modern-rcon';
import { MinecraftLogClient } from '../../MinecraftLogClient/MinecraftLogClient';
import StorageRegister from '../../StorageRegister';
import IdentityService from '../IdentityService';
import ChatServer from '../Server';
import MinecraftIdentity from './MinecraftIdentity';
import MinecraftIdentityCache from './MinecraftIdentityCache';
import MinecraftMessage from './MinecraftMessage';
import MinecraftTextChannel from './MinecraftTextChannel';

export default class MinecraftServer
	implements ChatServer<MinecraftIdentity, MinecraftTextChannel> {
	private textChannel: MinecraftTextChannel;
	private identityCache: MinecraftIdentityCache;

	constructor(
		private logReader: MinecraftLogClient,
		private rcon: Rcon | null,
		storage: StorageRegister,
		private identityService: IdentityService
	) {
		this.textChannel = new MinecraftTextChannel(this, this.rcon);
		this.identityCache = new MinecraftIdentityCache(this, storage);
	}

	async getTextChannels() {
		return [this.textChannel];
	}

	async getAudioChannels() {
		return [];
	}

	on(event: string, listener: (...args: any[]) => void) {
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

	async getPrivateTextChannel(): Promise<null> {
		return null;
	}

	getId() {
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

	getIdentityService() {
		return this.identityService;
	}
}
