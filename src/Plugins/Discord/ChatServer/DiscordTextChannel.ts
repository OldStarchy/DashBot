import Discord from 'discord.js';
import TextChannel from '../../../ChatServer/TextChannel';
import DiscordMessage from './DiscordMessage';
import DiscordServer from './DiscordServer';

export default class DiscordTextChannel implements TextChannel {
	constructor(
		private readonly _server: DiscordServer,
		private readonly _channel: Discord.Message['channel']
	) {}

	get id() {
		return this._channel.id;
	}

	get name() {
		if (this._channel instanceof Discord.DMChannel) {
			return 'DM with ' + this._channel.recipient.username;
		} else {
			if ('name' in this._channel) return this._channel.name;
			//TODO: make this return null?
			return this._channel.id;
		}
	}

	get canSend() {
		return true;
	}

	get canReceive() {
		return true;
	}

	get server() {
		return this._server;
	}

	async sendText(message: string): Promise<DiscordMessage> {
		const discordMessage = await this._channel.send(message);
		return new DiscordMessage(this, discordMessage);
	}

	async sendTyping() {
		await this._channel.sendTyping();
	}

	get supportsReactions() {
		return true;
	}
}
