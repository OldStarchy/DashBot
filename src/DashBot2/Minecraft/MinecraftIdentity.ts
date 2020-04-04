import Identity from '../Identity';
import MinecraftServer from './MinecraftServer';

export default class MinecraftIdentity implements Identity {
	constructor(
		private readonly _server: MinecraftServer,
		private readonly _username: string,
		private readonly _id?: string
	) {}

	get id() {
		//TODO: Maybe don't use username as id? id's aren't always known though
		return this._id ?? this._username;
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

	async getPrivateTextChannel() {
		return null;
	}

	getPerson() {
		return this.server
			.getIdentityService()
			.getById(this.server.id, this.id);
	}
}
