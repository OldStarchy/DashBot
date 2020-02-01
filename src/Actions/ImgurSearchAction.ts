import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { ImgurResponse } from '../ImgurResponse';
import selectRandom from '../SelectRandom';

export class ImgurSearchAction extends Action {
	handle(message: Message): ActionResult {
		const match = /^!imgur (.*)/i.exec(message.content);
		if (match) {
			const q = match[1];
			fetch('https://api.imgur.com/3/gallery/search?q=' + encodeURI(q), {
				headers: [
					[
						'Authorization',
						'Client-ID ' + this.bot.config.imgurClientId,
					],
				],
			})
				.then(r => r.json())
				.then((json: ImgurResponse) => {
					if (json.success) {
						const img = selectRandom(json.data, 20);
						if (img) {
							message.channel
								.send(img.title)
								.then(() => message.channel.send(img.link));
							this.bot.stats.recordUserTriggeredEvent(
								message.author.username,
								'search imgur'
							);
						} else {
							message.channel.send('no results... i guess');
						}
					} else {
						message.channel.send(
							"Imgur doesn't like me right now sorry"
						);
					}
				});
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
