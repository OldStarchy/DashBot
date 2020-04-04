import Discord from 'discord.js';
import TextChannel from '../TextChannel';
import DiscordMessage from './DiscordMessage';
import DiscordServer from './DiscordServer';

export default class DiscordTextChannel implements TextChannel {
	constructor(
		private readonly _server: DiscordServer,
		private readonly _channel:
			| Discord.DMChannel
			| Discord.TextChannel
			| Discord.GroupDMChannel
	) {}

	get id() {
		return this._channel.id;
	}

	get name() {
		if (this._channel instanceof Discord.DMChannel) {
			return 'DM with ' + this._channel.recipient.username;
		} else {
			return this._channel.name;
		}
	}

	getServer() {
		return this._server;
	}

	canSend() {
		return true;
	}

	canReceive() {
		return true;
	}

	async sendText(message: string): Promise<DiscordMessage> {
		const discordMessage = await this._channel.send(message);
		return new DiscordMessage(this, discordMessage);
	}

	getSupportsReactions() {
		return true;
	}
}
