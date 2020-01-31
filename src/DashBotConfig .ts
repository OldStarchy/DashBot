export interface DashBotConfig {
	/**
	 * Client ID taken from the discord developer site
	 */
	clientId?: string;
	/**
	 * Client Secret taken from the discord developer site
	 */
	clientSecret?: string;
	/**
	 * The Bot token taken from the discord developer site
	 */
	discordBotToken: string;
	imgurClientId: string;
	imgurClientSecret: string;
	statsFileLocation: string;
}
