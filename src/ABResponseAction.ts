import { Message } from 'discord.js';
import { Action } from './Action';
import { ActionResult } from './ActionResult';
import DashBot from './DashBot';
export class ABResponseAction extends Action {
	constructor(bot: DashBot, protected aBResponses: [string, string][]) {
		super(bot);
	}
	handle(message: Message) {
		return new ActionResult(
			this.aBResponses.some(ab => {
				if (ab[0].toLowerCase() === message.content) {
					message.channel.send(ab[1]);
					return true;
				}
				return false;
			})
		);
	}
}
