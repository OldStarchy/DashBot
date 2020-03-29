import Identity from '../Identity';

export default class MinecraftIdentity extends Identity {
	constructor(
		private readonly username: string,
		private readonly id?: string
	) {
		super();
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.username;
	}

	getPrivateTextChannel() {
		return null;
	}
}
