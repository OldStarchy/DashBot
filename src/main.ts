//@ts-check

import discord from 'discord.js';
import Config from './dashbot.config';



const client = new discord.Client();



client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	if (msg.content === 'ping') {
		msg.reply('Pong!');
	}
});

client.login(Config.botToken);
