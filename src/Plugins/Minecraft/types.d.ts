import ChatServer from '../../ChatServer/ChatServer';
import DeathMessage from './LogClient/PlayerDeathMessage';

declare global {
	interface DashBotEvents {
		'game.death': { message: DeathMessage; server: ChatServer };
	}

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

	// interface MinecraftServerConfigTypes {
	// 	minecraft: number; //MinecraftServerConfig[];
	// }

	/**
	 * Enables communication with a Minecraft server
	 */
	interface MinecraftServerConfig extends ChatServerConfig {
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
	}
}
