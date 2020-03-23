interface DashBotConfig {
	botName?: string;
	botVersion?: string;
	discordBotToken: string;
	imgurClientId?: string;
	statsFileLocation: string;

	/**
	 * Log extra debug messages
	 */
	debug?: boolean;

	minecraftClient?:
		| { type: 'none' }
		| {
				type: 'webhook';
				maintainerEmail: string;
				packageAgent?: string;
		  }
		| {
				type: 'tail';
				logFilePath: string;
		  };
}
