import Discord from 'discord.js';
import DiscordMessage from './DiscordMessage';
import DiscordServer from './DiscordServer';
import TextChannel from './TextChannel';

export default class DiscordTextChannel implements TextChannel {
	constructor(
		private readonly server: DiscordServer,
		private readonly channel:
			| Discord.DMChannel
			| Discord.TextChannel
			| Discord.GroupDMChannel
	) {}

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

	getName() {
		if (this.channel instanceof Discord.DMChannel) {
			return 'Direct Message';
		} else {
			return this.channel.name;
		}
	}

	getServer() {
		return this.server;
	}
}
