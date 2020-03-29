import Discord from 'discord.js';
import Identity from '../Identity';

export default class DiscordIdentity extends Identity {
	constructor(private readonly person: Discord.User) {
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
}
