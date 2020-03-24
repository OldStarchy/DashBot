import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { ImgurResponse } from '../ImgurResponse';
import selectRandom from '../util/selectRandom';

/**
 * Performs an Imgur search and posts a random result
 */
export class ImgurSearchAction extends Action {
	async handle(message: Message) {
		const match = /^!imgur (.*)/i.exec(message.content);
		if (match) {
			const q = match[1];

			const response = await fetch(
				'https://api.imgur.com/3/gallery/search?q=' + encodeURI(q),
				{
					headers: [
						[
							'Authorization',
							'Client-ID ' + this.bot.config.imgurClientId,
						],
					],
				}
			);

			const json: ImgurResponse = await response.json();

			if (json.success) {
				const img = selectRandom(json.data, 20);

				if (img) {
					await message.channel.send(img.title);
					await message.channel.send(img.link);
				} else {
					message.channel.send('no results... i guess');
				}
			} else {
				message.channel.send("Imgur doesn't like me right now sorry");
			}

			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
