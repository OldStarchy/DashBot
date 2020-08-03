import ChatServer from '../../../ChatServer/ChatServer';
import Identity from '../../../ChatServer/Identity';

export default class MinecraftIdentity implements Identity {
	constructor(
		public readonly server: ChatServer,
		public readonly username: string,
		public readonly id: string,
		public readonly isBot: boolean
	) {}

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
