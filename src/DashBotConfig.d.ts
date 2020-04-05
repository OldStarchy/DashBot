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
	port: number;
	password: string;
}

interface ChatServerConfig {
	type: string;
	id?: string;
}

interface DashBotConfig {
	/**
	 * Default: 'DashBot'
	 */
	botName?: string;

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
	 * Connection information for the services the bot should connect to
	 */
	servers: ChatServerConfig[];

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
