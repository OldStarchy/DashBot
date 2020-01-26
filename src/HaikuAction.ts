import { Message } from 'discord.js';
import { ActionResult } from './ActionResult';
import { Action } from './Action';
import { random as getHaiku } from 'haiku-random';

export class HaikuAction extends Action {
	handle(message: Message) {
		const match = /^!haiku/i.exec(message.content);
		if (match) {
			const haiku = getHaiku('shell');

			message.channel.send(haiku);
			return new ActionResult(true);
		}
		return new ActionResult(false);
	}
}
