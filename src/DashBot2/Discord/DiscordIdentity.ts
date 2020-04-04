import Discord from 'discord.js';
import Identity from '../Identity';
import DiscordServer from './DiscordServer';

export default class DiscordIdentity implements Identity {
	constructor(
		private readonly _server: DiscordServer,
		private readonly _person: Discord.User
	) {}

	get id() {
		return this._person.id;
	}

	get username() {
		return this._person.username;
	}

	getIsBot() {
		return this._person.bot;
	}

	getDiscordUser() {
		return this._person;
	}

	getPerson() {
		return this.getServer()
			.getIdentityService()
			.getById(this.getServer().id, this.id);
	}

	async getPrivateTextChannel() {
		return this.getServer().getPrivateTextChannel(this);
	}

	getServer() {
		return this._server;
	}
}
