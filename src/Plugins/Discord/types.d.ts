interface DiscordServerConfig extends ChatServerConfig {
	type: 'discord';
	/**
	 * Discord API bot token
	 */
	botToken: string;
}
