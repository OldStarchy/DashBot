//@ts-check

import path from 'path';
import DiscordServerFactory, {
	DiscordServerConfig,
} from './ChatServer/Discord/DiscordServerFactory';
import IdentityService from './ChatServer/IdentityService';
import MinecraftServerFactory, {
	MinecraftServerConfig,
} from './ChatServer/Minecraft/MinecraftServerFactory';
import DashBot from './DashBot';
import loadConfig from './loadConfig';
import Permissions from './Permissions';
import createLogger from './Startup/createLogger';
import handleCli from './Startup/handleCli';
import registerAllComponents from './Startup/registerAllComponents';
import StatisticsTracker from './StatisticsTracker';
import StorageRegister from './StorageRegister';

const args = process.argv.slice(2);

const storageDir = handleCli(args);
const logger = createLogger(storageDir);

process.on('uncaughtException', e => {
	logger.error(e.message);
	process.exit(1);
});

const config = loadConfig(storageDir);
const packageRoot = path.dirname(__dirname);

const bot = new DashBot(logger);
const storageFile = path.join(storageDir, 'storage.json');
const storage = new StorageRegister(storageFile, logger, true);
const identityService = new IdentityService(storage);
const statistics = new StatisticsTracker();
const permissions = new Permissions(storage);

function createServerFromConfig(serverConfig: ChatServerConfig) {
	switch (serverConfig.type) {
		case 'minecraft':
			return new MinecraftServerFactory().make(
				serverConfig as MinecraftServerConfig,
				storage,
				identityService,
				config,
				storageDir,
				packageRoot,
				logger
			);

		case 'discord':
			return new DiscordServerFactory().make(
				serverConfig as DiscordServerConfig,
				identityService,
				logger
			);

		default:
			throw new Error('Unrecognized server type');
	}
}

for (const serverConfig of config.servers) {
	const server = createServerFromConfig(serverConfig);

	if (server) {
		bot.addServer(server);
		identityService.addProvider(server);
	}
}

registerAllComponents(
	bot,
	storage,
	identityService,
	statistics,
	config,
	permissions
);

bot.connect();

const signals: Record<'SIGHUP' | 'SIGINT' | 'SIGTERM', number> = {
	SIGHUP: 1,
	SIGINT: 2,
	SIGTERM: 15,
};

const shutdown = async (signal: string, value: number) => {
	logger.info(`Shutting down due to ${signal}`);
	await bot.disconnect();

	logger.info(`server stopped by ${signal} with value ${value}`);
	process.exit(128 + value);
};

(Object.keys(signals) as ('SIGHUP' | 'SIGINT' | 'SIGTERM')[]).forEach(
	signal => {
		process.on(signal, () => {
			shutdown(signal, signals[signal]);
		});
	}
);
