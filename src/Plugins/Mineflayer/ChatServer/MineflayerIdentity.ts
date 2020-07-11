import Identity from '../../../ChatServer/Identity';
import MineflayerClient from './MineflayerClient';

export default class MineflayerIdentity implements Identity {
	constructor(
		private readonly _server: MineflayerClient,
		private readonly _username: string,
		private readonly _id: string,
		private readonly _isBot: boolean
	) {}

	get id() {
		return this._id;
	}

	get username() {
		return this._username;
	}

	get isBot() {
		return this._isBot;
	}

	get server() {
		return this._server;
	}

	get tag() {
		return this.username;
	}
	async getPrivateTextChannel() {
		return await this._server.getPrivateTextChannel(this);
	}

	getPerson() {
		return this.server
			.getIdentityService()
			.getById(this.server.id, this.id);
	}
}
