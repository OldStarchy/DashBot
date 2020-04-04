import fetch from 'node-fetch';
import { ImgurResponse } from '../../ImgurResponse';
import selectRandom from '../../util/selectRandom';
import Command from '../Command';
import Message from '../Message';

/**
 * Performs an Imgur search and posts a random result
 */
export default class ImgurCommand implements Command {
	constructor(private readonly _imgur: ImgurClient) {}

	async run(message: Message | null, _: string, ...query: string[]) {
		if (message === null) {
			return;
		}

		const channel = message.channel;
		const searchResults = await this._imgur.search(query.join(' '));

		if (searchResults.success) {
			const img = selectRandom(searchResults.data, 20);

			if (img) {
				await channel.sendText(img.title);
				await channel.sendText(img.link);
			} else {
				await channel.sendText('no results... i guess');
			}
		} else {
			await channel.sendText("Imgur doesn't like me right now sorry");
		}
	}
}

export class ImgurClient {
	private static readonly BASE_URL = 'https://api.imgur.com/3';
	constructor(private _clientId: string) {}

	async search(query: string) {
		return (await this.get(
			'/gallery/search?q=' + encodeURI(query)
		)) as ImgurResponse;
	}

	private async get(url: string) {
		const response = await fetch(ImgurClient.BASE_URL + url, {
			headers: [['Authorization', 'Client-ID ' + this._clientId]],
		});

		return await response.json();
	}
}
