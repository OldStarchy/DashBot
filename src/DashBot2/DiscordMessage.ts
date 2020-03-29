import Discord from 'discord.js';
import DiscordIdentity from './DiscordIdentity';
import DiscordTextChannel from './DiscordTextChannel';
import Message from './Message';

export default class DiscordMessage implements Message {
	constructor(
		private channel: DiscordTextChannel,
		private message: Discord.Message
	) {}

	getAuthor() {
		return new DiscordIdentity(this.message.author);
	}

	getChannel() {
		return this.channel;
	}

	getId() {
		return this.message.id;
	}
}
