interface MinecraftLogTailConfig {
	/**
	 * Reads chat messages from a Minecraft log file.
	 */
	type: 'tail';

	/**
	 * The path to Minecraft's "latest.log" file.
	 */
	logFilePath: string;
}
interface MinecraftLogPumpConfig {
	/**
	 * Listens for web requests from a "Minecraft Log Pump" client.
	 */
	type: 'webhook';

	/**
	 * Default: false
	 * If true, and the tls is not configured, the Minecraft chat service will listen for requests over http
	 */
	allowInsecure?: boolean;

	/**
	 * A list of IP addresses that can post Minecraft log messages to dashbot.
	 */
	whitelist?: string[];
}

interface MinecraftRconConfig {
	host: string;
	port: string;
}

interface DashBotConfig {
	/**
	 * Default: 'DashBot'
	 */
	botName?: string;

	discordBotToken: string;

	/**
	 * Default: null
	 * If set, enables the `!imgur <search>` command to return random Imgur image search results.
	 */
	imgurClientId?: string;

	/**
	 * Default: false
	 * Log extra debug messages
	 */
	debug?: boolean;

	/**
	 * Default: null
	 * Enables communication with a Minecraft server
	 */
	minecraft?: {
		/**
		 * Default: null
		 * Configuring this allows dashbot to relay messages from a Minecraft server to a channel in discord
		 */
		logClient?: MinecraftLogTailConfig | MinecraftLogPumpConfig;

		/**
		 * Default: null
		 * Configuring this allows dashbot to relay messages from a channel in discord to a Minecraft server
		 */
		rcon?: MinecraftRconConfig;
	};

	/**
	 * Default: null
	 * Configuring this allows automatic creation of tls certificates (for https)
	 */
	tls?: {
		maintainerEmail: string;

		/**
		 * Default: config.botName + '/' + VERSION
		 * The user agent set when requesting a certificate from lets encrypt
		 */
		packageAgent?: string;
	};
}
