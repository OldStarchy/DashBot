interface ChatServerConfig {
	type: string;
	id?: string;
	autoConnect?: boolean;
}

interface DashBotConfig {
	/**
	 * Default: 'DashBot'
	 */
	botName?: string;

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
