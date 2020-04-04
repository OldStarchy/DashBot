import Discord from 'discord.js';
import Identity from '../Identity';
import DiscordServer from './DiscordServer';

export default class DiscordIdentity implements Identity {
	constructor(
		private readonly server: DiscordServer,
		private readonly person: Discord.User
	) {}

	get id() {
		return this.person.id;
	}

	get username() {
		return this.person.username;
	}

	getIsBot() {
		return this.person.bot;
	}

	getDiscordUser() {
		return this.person;
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
		return this.server;
	}
}
