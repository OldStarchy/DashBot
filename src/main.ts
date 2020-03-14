//@ts-check

import { Client as DiscordClient } from 'discord.js';
import express from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import winston from 'winston';
import DashBot, { DashBotOptions } from './DashBot';
import { DashBotConfig } from './DashBotConfig';
import { MinecraftPumpLogClient } from './MInecraftLogClient/MinecraftPumpLogClient';
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

const options: DashBotOptions = {
	config,
	client: new DiscordClient(),
	stats: new StatTracker(join(storageDir, config.statsFileLocation)),
	logger,
};

switch (config.minecraftClient?.type) {
	case undefined:
	case 'none':
		break;
	case 'webhook': {
		const minecraftClient = new MinecraftPumpLogClient({
			express,
			port: config.minecraftClient.port ?? 25580,
		});

		minecraftClient.on('chatMessage', message => {
			// eslint-disable-next-line no-console
			console.log('Received message from ' + message.author);
		});

		options.minecraftClient = minecraftClient;
		break;
	}
}

const bot = new DashBot(options);

bot.login();

process.on('SIGINT', e => {
	logger.warn(e);
	bot.destroy().then(() => process.exit());
});
