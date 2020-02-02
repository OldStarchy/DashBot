import { Message, TextChannel } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import DashBot from '../DashBot';
import selectRandom from '../util/selectRandom';

export class OneOffReplyAction extends Action {
	private readonly trigger: (message: Message) => boolean;
	constructor(
		bot: DashBot,
		triggerOrKeywords: ((message: Message) => boolean) | string[],
		private readonly replies: (
			| Parameters<TextChannel['sendMessage']>[0]
			| string
		)[]
	) {
		super(bot);
		if (triggerOrKeywords instanceof Array) {
			this.trigger = (msg): boolean =>
				triggerOrKeywords.includes(msg.content);
		} else {
			this.trigger = triggerOrKeywords.bind(null);
		}
	}
	handle(message: Message): ActionResult {
		if (this.trigger(message)) {
			let compliment = selectRandom(this.replies);
			const replacements = [['@n', message.author.username]];
			if (typeof compliment === 'string') {
				compliment = replacements.reduce(
					(comp, replacement) =>
						comp.replace(replacement[0], replacement[1]),
					compliment
				);
				message.channel.send(compliment);
			} else {
				message.channel.send(compliment);
			}
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
