import { Message } from 'discord.js';
import { random as getHaiku } from 'haiku-random';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';

export class HaikuAction extends Action {
	async handle(message: Message) {
		const match = /^!haiku/i.exec(message.content);
		if (match) {
			const haiku = getHaiku('shell');

			message.channel.send(haiku);
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
