import Discord from 'discord.js';
import Message from '../../../ChatServer/Message';
import DiscordIdentity from './DiscordIdentity';
import DiscordTextChannel from './DiscordTextChannel';

export default class DiscordMessage implements Message {
	constructor(
		private _channel: DiscordTextChannel,
		private _message: Discord.Message
	) {}

	get author() {
		return new DiscordIdentity(this.channel.server, this._message.author);
	}

	get channel() {
		return this._channel;
	}

	get id() {
		return this._message.id;
	}

	get textContent() {
		return this._message.cleanContent;
	}

	get rawContent() {
		return this._message.content;
	}

	async react(emoji: string) {
		await this._message.react(emoji);
	}

	get discordMessage() {
		return this._message;
	}
}
