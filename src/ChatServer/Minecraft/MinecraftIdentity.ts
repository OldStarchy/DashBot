import Identity from '../Identity';
import MinecraftServer from './MinecraftServer';

export default class MinecraftIdentity implements Identity {
	constructor(
		private readonly _server: MinecraftServer,
		private readonly _username: string,
		private readonly _id: string
	) {}

	get id() {
		return this._id;
	}

	get username() {
		return this._username;
	}

	get isBot() {
		return false; //probably
	}

	get server() {
		return this._server;
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
