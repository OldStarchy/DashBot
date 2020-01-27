import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';

export class DadJokeAction extends Action {
	handle(message: Message) {
		const match = /^joke( pls)?$/i.exec(message.content);

		if (match) {
			fetch('https://icanhazdadjoke.com/', {
				headers: [
					['Accept', ' application/json'],
					[
						'User-Agent',
						'DashBot Discord Bot (not public atm sorry)',
					],
				],
			})
				.then(r => r.json())
				.then((json: { id: string; joke: string; status: number }) => {
					if (json.status === 200) {
						message.channel.send(json.joke);
						this.bot.stats.recordUserTriggeredEvent(
							message.author.username,
							'get joke'
						);
					} else {
						message.channel.send(
							"icanhazdadjoke.com doesn't like me right now sorry"
						);
					}
				});
			return new ActionResult(true);
		}
		return new ActionResult(false);
	}
}
