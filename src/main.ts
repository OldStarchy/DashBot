//@ts-check

import fs from 'fs';
import { DateTime, Settings } from 'luxon';
import path from 'path';
import winston from 'winston';
import IdentityService from './ChatServer/IdentityService';
import DashBot from './DashBot';
import DashBotPlugin, { DashBotContext } from './DashBotPlugin';
import loadConfig from './loadConfig';
import MojangApiClient from './MojangApiClient';
import Permissions from './Permissions';
import MinecraftIdentityCache from './Plugins/Minecraft/ChatServer/MinecraftIdentityCache';
import handleCli from './Startup/handleCli';
import registerAllComponents from './Startup/registerAllComponents';
import StatisticsTracker from './StatisticsTracker';
import StorageRegister from './StorageRegister';

function configureWinston(loggingDir: string) {
	const errorStackTracerFormat = winston.format(info => {
		if (info.error && info.error instanceof Error) {
			info.message = `${
				info.message.length > 0 ? info.message + ' ' : ''
			}${info.error.stack}`;
		}
		return info;
	});
	const formatter = winston.format.printf(
		({ service, level, message }) =>
			`${DateTime.utc()
				.setZone('Australia/Adelaide')
				.toFormat(
					'yyyy-MM-dd HH:mm:ss'
				)} [${service}] ${level}: ${message}`
	);
	winston.configure({
		level: 'info',
		transports: [
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.colorize(),
					errorStackTracerFormat(),
					formatter
				),
			}),
			new winston.transports.File({
				filename: path.join(loggingDir, 'dashbot.log'),
				format: winston.format.combine(
					errorStackTracerFormat(),
					formatter
				),
			}),
		],
		defaultMeta: { service: 'core' },
	});
}

const args = process.argv.slice(2);
const storageDir = handleCli(args);

configureWinston(storageDir);

process.on('uncaughtException', e => {
	winston.error('Uncaught Exception', { error: e });
});

winston.info('Starting...');

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
const minecraftIdentityCache = new MinecraftIdentityCache({
	storage,
	mojangApiClient: new MojangApiClient(),
});

const context = new DashBotContext(
	bot,
	storage,
	identityService,
	statistics,
	permissions,
	config,
	storageDir,
	packageRoot,
	minecraftIdentityCache
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
		// try {
		winston.info(`Loading ${require.resolve('./' + file)}...`);
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const _import = require('./' + file);
		winston.info(`Loaded`);
		if (!_import.default) {
			winston.warn(
				`Plugin file "${require.resolve(
					'./' + file
				)}" is missing a default export.`
			);
			return;
		}
		const plugin = _import.default;

		if (plugin.prototype instanceof DashBotPlugin) {
			winston.info(`Instantiating plugin...`);
			plugins.push(new plugin());
			winston.info(`Done`);
		} else {
			throw new Error("File didn't return an instance of a plugin");
		}
		// } catch (e) {
		// 	winston.error(e);
		// }
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

const autoConnectServers: string[] = [];
for (const serverConfig of config.servers) {
	const server = createServerFromConfig(serverConfig);

	if (server) {
		if (serverConfig.autoConnect ?? true) {
			autoConnectServers.push(server.id);
		}

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

bot.connect(autoConnectServers);

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
