import fetch from 'node-fetch';
import Message from '../ChatServer/Message';
import Command from '../Command';

/**
 * Performs an Imgur search and posts a random result
 */
export default class JokeCommand extends Command {
	readonly name = 'joke';
	readonly description = 'Gets you an amazingly funny joke (sometimes).';

	constructor(private readonly _jokes: ICanHazDadJokeClient) {
		super();
	}

	async run(message: Message) {
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
					'DashBot Chat Bot (https://github.com/OldStarchy/DashBot)',
				],
			],
		});

		return await response.json();
	}
}
