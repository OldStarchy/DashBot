import Discord from 'discord.js';
import Identity from '../Identity';
import DiscordServer from './DiscordServer';

export default class DiscordIdentity extends Identity {
	constructor(
		private readonly server: DiscordServer,
		private readonly person: Discord.User
	) {
		super();
	}

	getId() {
		return this.person.id;
	}

	getName() {
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
			.getById(this.getServer().getId(), this.getId());
	}

	async getPrivateTextChannel() {
		return this.getServer().getPrivateTextChannel(this);
	}

	getServer() {
		return this.server;
	}
}
