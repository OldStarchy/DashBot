import { Message } from 'discord.js';
import selectRandom from './SelectRandom';
import fetch from 'node-fetch';
import Config from './dashbot.config';
import { ImgurResponse } from './ImgurResponse';
import { Action } from './Action';
import { ActionResult } from './ActionResult';
export class ImgurSearchAction extends Action {
	handle(message: Message) {
		const match = /^!imgur (.*)/i.exec(message.content);
		if (match) {
			const q = match[1];
			fetch('https://api.imgur.com/3/gallery/search?q=' + encodeURI(q), {
				headers: [
					['Authorization', 'Client-ID ' + Config.imgurClientId],
				],
			})
				.then(r => r.json())
				.then((json: ImgurResponse) => {
					if (json.success) {
						const img = selectRandom(json.data, 20);
						if (img) {
							message.channel
								.send(img.title)
								.then(r => message.channel.send(img.link));
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
			return new ActionResult(true);
		}
		return new ActionResult(false);
	}
}
