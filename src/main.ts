//@ts-check

import DashBot from './DashBot';
import Config from './dashbot.config';
import { Client } from 'discord.js';

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
