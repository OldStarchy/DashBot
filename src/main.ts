//@ts-check

import { Client } from 'discord.js';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import winston from 'winston';
import DashBot from './DashBot';
import { DashBotConfig } from './DashBotConfig';
import { StatTracker } from './StatTracker';
import { formatTime } from './util/formatTime';

const args = process.argv.slice(2);

const storageDir = resolve(
	((): string => {
		if (args.length === 0) {
			return 'storage';
		}

		if (args.length === 2 && args[0] === '--storage') {
			return args[1];
		}

		throw new Error(
			'Invalid arguments supplied. Either 0 or 2 arguments expected. Should be node main.js --storage path/to/storage/dir'
		);
	})()
);

// eslint-disable-next-line no-console
console.log(`Storage location set to ${storageDir}`);

if (!existsSync(storageDir)) {
	throw new Error(
		`Can\'t find storage directory at "${storageDir}", make sure it exists`
	);
}

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.printf(
		({ service, level, message }) =>
			`${formatTime(new Date())} [${service}] ${level}: ${message}`
	),
	defaultMeta: { service: 'dashbot' },
	transports: [
		new winston.transports.Console({ format: winston.format.simple() }),
		new winston.transports.File({
			filename: join(storageDir, 'dashbot.log'),
		}),
	],
});

process.on('uncaughtException', e => {
	logger.error(e);
	process.exit(1);
});

const config = ((): DashBotConfig => {
	const configFileName = 'dashbot.config';
	const path = join(storageDir + '/' + configFileName);

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const config = require(path);
	logger.info(`Loading config from "${path}"`);

	return config;
})();

const bot = new DashBot({
	config,
	client: new Client(),
	stats: new StatTracker(join(storageDir, config.statsFileLocation)),
	logger,
});

bot.login();

process.on('SIGINT', e => {
	logger.warn(e);
	bot.destroy().then(() => process.exit());
});
