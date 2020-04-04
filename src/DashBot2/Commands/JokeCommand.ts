import fetch from 'node-fetch';
import Command from '../Command';
import Message from '../Message';

/**
 * Performs an Imgur search and posts a random result
 */
export default class JokeCommand implements Command {
	constructor(private readonly _jokes: ICanHazDadJokeClient) {}

	async run(message: Message | null) {
		if (message === null) {
			return;
		}

		const response = await this._jokes.getJoke();

		const reply =
			response.status === 200
				? response.joke
				: "icanhazdadjoke.com doesn't like me right now sorry";

		await message.channel.sendText(reply);
	}
}

export class ICanHazDadJokeClient {
	private static readonly BASE_URL = 'https://icanhazdadjoke.com';

	async getJoke() {
		return (await this.get('/')) as {
			status: number;
			joke: string;
		};
	}

	private async get(url: string) {
		const response = await fetch(ICanHazDadJokeClient.BASE_URL + url, {
			headers: [
				['Accept', ' application/json'],
				[
					'User-Agent',
					'DashBot Discord Bot (https://github.com/aNickzz/DashBot)',
				],
			],
		});

		return await response.json();
	}
}
