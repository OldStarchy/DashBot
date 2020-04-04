import Discord from 'discord.js';
import TextChannel from '../TextChannel';
import DiscordMessage from './DiscordMessage';
import DiscordServer from './DiscordServer';

export default class DiscordTextChannel implements TextChannel {
	constructor(
		private readonly server: DiscordServer,
		private readonly channel:
			| Discord.DMChannel
			| Discord.TextChannel
			| Discord.GroupDMChannel
	) {}

	getId() {
		return this.channel.id;
	}

	getName() {
		if (this.channel instanceof Discord.DMChannel) {
			return 'DM with ' + this.channel.recipient.username;
		} else {
			return this.channel.name;
		}
	}

	getServer() {
		return this.server;
	}

	canSend() {
		return true;
	}

	canReceive() {
		return true;
	}

	async sendText(message: string): Promise<DiscordMessage> {
		const discordMessage = await this.channel.send(message);
		return new DiscordMessage(this, discordMessage);
	}

	getSupportsReactions() {
		return true;
	}
}
