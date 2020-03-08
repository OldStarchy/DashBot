import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';

interface Joke {
	id: string;
	joke: string;
	status: number;
}

/**
 * Responds with a random dad joke from the free API https://icanhazdadjoke.com/.
 */
export class DadJokeAction extends Action {
	async handle(message: Message) {
		const match = /^joke( pls)?$/i.exec(message.content);

		if (match) {
			const response = await fetch('https://icanhazdadjoke.com/', {
				headers: [
					['Accept', ' application/json'],
					[
						'User-Agent',
						'DashBot Discord Bot (https://github.com/aNickzz/DashBot)',
					],
				],
			});

			const joke = await response.json();

			if (joke.status === 200) {
				message.channel.send(joke.joke);

				this.bot.stats.recordUserTriggeredEvent(
					message.author.username,
					'get joke'
				);
			} else {
				message.channel.send(
					"icanhazdadjoke.com doesn't like me right now sorry"
				);
			}
			return ActionResult.HANDLED;
		}

		return ActionResult.UNHANDLED;
	}
}
