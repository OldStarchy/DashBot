//@ts-check

import { Client } from 'discord.js';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import winston from 'winston';
import DashBot from './DashBot';
import { DashBotConfig } from './DashBotConfig';

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

console.log(`Storage location set to ${storageDir}`);

if (!existsSync(storageDir)) {
	throw new Error(
		`Can\'t find storage directory at "${storageDir}", make sure it exists`
	);
}

function formatTime(date: Date) {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();

	return `${hours}:${minutes}:${seconds}`;
}

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.printf(
		({ service, level, message }) =>
			`${formatTime(new Date())} [${service}] ${level}: ${message}`
	),
	defaultMeta: { service: 'dashbot' },
	transports: [
		new winston.transports.Console({ format: winston.format.simple() }),
		new winston.transports.File({
			filename: join(storageDir, 'combined.log'),
		}),
		new winston.transports.File({
			filename: join(storageDir, 'error.log'),
			level: 'error',
		}),
	],
});

const config: DashBotConfig = (() => {
	const configFileName = 'dashbot.config';
	const path = join(storageDir + '/' + configFileName);

	const config = require(path);
	logger.info(`Loading config from "${path}"`);

	return config;
})();

const client = new Client();

const dashbot = new DashBot({
	client,
	config,
});

client.on('ready', () => {
	logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.content === 'ping') {
		msg.reply('Pong!');
	}
});

client.login(config.discordBotToken);

process.on('SIGINT', () => {
	client.destroy().then(() => process.exit());
});
