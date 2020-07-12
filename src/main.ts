//@ts-check

import fs from 'fs';
import { Settings } from 'luxon';
import path from 'path';
import winston from 'winston';
import IdentityService from './ChatServer/IdentityService';
import DashBot from './DashBot';
import DashBotPlugin, { DashBotContext } from './DashBotPlugin';
import loadConfig from './loadConfig';
import Permissions from './Permissions';
import handleCli from './Startup/handleCli';
import registerAllComponents from './Startup/registerAllComponents';
import StatisticsTracker from './StatisticsTracker';
import StorageRegister from './StorageRegister';

const args = process.argv.slice(2);

const storageDir = handleCli(args);

winston.level = 'info';
winston.add(new winston.transports.Console({ format: winston.format.json() }));
winston.add(
	new winston.transports.File({
		filename: path.join(storageDir, 'dashbot.log'),
	})
);

process.on('uncaughtException', e => {
	winston.error(e.message);
	process.exit(1);
});
Settings.defaultLocale = 'en-AU';
Settings.defaultZoneName = 'Australia/Adelaide';
const config = loadConfig(storageDir);
const packageRoot = path.dirname(__dirname);

const bot = new DashBot(config.botName ?? 'DashBot');
const storageFile = path.join(storageDir, 'storage.json');
const storage = new StorageRegister(storageFile, true);
const identityService = new IdentityService(storage);
const statistics = new StatisticsTracker();
const permissions = new Permissions(storage);

const context = new DashBotContext(
	bot,
	storage,
	identityService,
	statistics,
	permissions,
	config,
	storageDir,
	packageRoot
);

// TODO: Move to config, allow multiple plugin locations (builtin + custom)
const pluginsDir = './Plugins';

const plugins: DashBotPlugin[] = [];

fs.readdirSync(pluginsDir)
	.filter(file => file !== '.' && file !== '..')
	.map(file => {
		const fullPath = path.join('.', pluginsDir, file);
		if (fs.statSync(fullPath).isDirectory())
			return path.join(file, 'Plugin.js');

		return file;
	})
	.filter(file => file.endsWith('Plugin.js'))
	.sort()
	.map(file => path.join(pluginsDir, file))
	.forEach(file => {
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const _import = require('./' + file);
			if (!_import.default) {
				winston.warn(
					`Plugin file "${require.resolve(
						file
					)}" is missing a default export.`
				);
				return;
			}
			const plugin = _import.default;

			if (plugin.prototype instanceof DashBotPlugin) {
				plugins.push(new plugin());
			} else {
				throw new Error("File didn't return an instance of a plugin");
			}
		} catch (e) {
			winston.error(e);
		}
	});

plugins.forEach(plugin => {
	winston.info(`Adding plugin "${plugin.name}".`);
	plugin.register(context);
});

winston.info(
	`${plugins.length} plugin${plugins.length !== 1 ? 's' : ''} loaded.`
);

function createServerFromConfig(serverConfig: ChatServerConfig) {
	if (context.chatServerFactories[serverConfig.type])
		return context.chatServerFactories[serverConfig.type](serverConfig);

	winston.error('Unrecognized server type');
}

for (const serverConfig of config.servers) {
	const server = createServerFromConfig(serverConfig);

	if (server && (serverConfig.autoConnect ?? true)) {
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

const shutdown = async (signal?: string, value?: number) => {
	if (signal) winston.info(`Shutting down due to ${signal}`);
	else winston.info(`Shutting down`);
	await bot.disconnect();

	if (value) {
		winston.info(`server stopped by ${signal} with value ${value}`);
		process.exit(128 + value);
	} else process.exit(0);
};

(Object.keys(signals) as ('SIGHUP' | 'SIGINT' | 'SIGTERM')[]).forEach(
	signal => {
		process.on(signal, () => {
			shutdown(signal, signals[signal]);
		});
	}
);

// For safe shutdown when debugging
(global as any).shutdown = shutdown;
