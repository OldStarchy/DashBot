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

	get isBot() {
		return this._person.bot;
	}

	get server() {
		return this._server;
	}

	getDiscordUser() {
		return this._person;
	}

	getPerson() {
		return this.server
			.getIdentityService()
			.getById(this.server.id, this.id);
	}

	async getPrivateTextChannel() {
		return this.server.getPrivateTextChannel(this);
	}
}
