//@ts-check

import DashBot from './DashBot';
import { Client } from 'discord.js';
import Config from './DashbotConfig';
import { createWriteStream } from 'fs';

// if (Config.logToFile) {
// 	const dir = 'config';
// 	const access = createWriteStream(dir + '/node.access.log', { flags: 'a' });
// 	const error = createWriteStream(dir + '/node.error.log', { flags: 'a' });

// 	// redirect stdout / stderr
// 	// process.stdout.pipe(access);
// 	process.stderr.pipe(error);
// }

const client = new Client();

const dashbot = new DashBot(client);

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.content === 'ping') {
		msg.reply('Pong!');
	}
});

client.login(Config.botToken);
