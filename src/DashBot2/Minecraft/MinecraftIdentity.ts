import Identity from '../Identity';
import MinecraftServer from './MinecraftServer';

export default class MinecraftIdentity extends Identity {
	constructor(
		private readonly server: MinecraftServer,
		private readonly username: string,
		private readonly id?: string
	) {
		super();
	}

	getId() {
		//TODO: Maybe don't use username as id? id's aren't always known though
		return this.id ?? this.username;
	}

	getName() {
		return this.username;
	}

	getServer() {
		return this.server;
	}

	async getPrivateTextChannel() {
		return null;
	}

	getIsBot() {
		return false; //probably
	}

	getPerson() {
		return this.getServer()
			.getIdentityService()
			.getById(this.getServer().getId(), this.getId());
	}
}
