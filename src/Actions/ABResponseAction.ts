import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import DashBot from '../DashBot';

/**
 * Simple a -> b lookup.
 *
 * ```
 *  new ABMessageAction(this, [
 *  	['a', 'b']
 *  ])
 * ```
 *
 * Eg. If the message is "a" it will respond with "b"
 */
export class ABResponseAction extends Action {
	constructor(bot: DashBot, protected aBResponses: [string, string][]) {
		super(bot);
	}

	async handle(message: Message) {
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
