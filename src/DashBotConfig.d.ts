interface DashBotConfig {
	/**
	 * Not used
	 */
	discordClientId?: string;
	/**
	 * Not used
	 */
	discordClientSecret?: string;
	discordBotToken: string;
	imgurClientId?: string;
	/**
	 * Not used
	 */
	imgurClientSecret?: string;
	statsFileLocation: string;

	/**
	 * Log extra debug messages
	 */
	debug?: boolean;

	minecraftClient?:
		| { type: 'none' }
		| {
				type: 'webhook';
				/**
				 * Default 25580
				 */
				port?: number;
		  }
		| {
				type: 'tail';
				logFilePath: string;
		  };
}
