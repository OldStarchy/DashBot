import Discord from 'discord.js';
import Message from '../Message';
import DiscordIdentity from './DiscordIdentity';
import DiscordTextChannel from './DiscordTextChannel';

export default class DiscordMessage implements Message {
	constructor(
		private _channel: DiscordTextChannel,
		private _message: Discord.Message
	) {}

	get author() {
		return new DiscordIdentity(
			this.channel.getServer(),
			this._message.author
		);
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

	async react(emoji: string) {
		this._message.react(emoji);
	}
}
