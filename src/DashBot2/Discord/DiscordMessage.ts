import Discord from 'discord.js';
import Message from '../Message';
import DiscordIdentity from './DiscordIdentity';
import DiscordTextChannel from './DiscordTextChannel';

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

	getTextContent() {
		return this.message.cleanContent;
	}
}
