import ChatServer from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';
import { MinecraftUser } from './MinecraftIdentityCache';

export default class MinecraftIdentity implements Identity {
	public readonly id: string;
	public readonly username: string;
	constructor(
		public readonly server: ChatServer,
		minecraftUser: MinecraftUser,
		public readonly isBot: boolean
	) {
		this.id = minecraftUser.uuid.replace(/-/g, '');
		this.username = minecraftUser.username;
	}

	get tag() {
		return this.username;
	}

	async getPrivateTextChannel() {
		return null;
	}

	getPerson() {
		return this.server
			.getIdentityService()
			.getById(this.server.id, this.id);
	}
}
