//@ts-check

import { Client } from 'discord.js';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import DashBot from './DashBot';
import { DashBotConfig } from './DashBotConfig';

const args = process.argv.slice(2);

const storageDir = resolve(
	(() => {
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

const config: DashBotConfig = (() => {
	const configFileName = 'dashbot.config';
	const path = join(storageDir + '/' + configFileName);

	const config = require(path);
	console.log(`Loading config from "${path}"`);

	return config;
})();

const client = new Client();

const dashbot = new DashBot({
	client,
	config,
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.content === 'ping') {
		msg.reply('Pong!');
	}
});

client.login(config.botToken);
