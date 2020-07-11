import Discord from 'discord.js';
import Identity from '../../../ChatServer/Identity';
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

	get tag() {
		return `<@!${this._person.id}>`;
	}

	getDiscordUser() {
		return this._person;
	}

	async getPerson() {
		return await this.server
			.getIdentityService()
			.getById(this.server.id, this.id);
	}

	async getPrivateTextChannel() {
		return this.server.getPrivateTextChannel(this);
	}
}
