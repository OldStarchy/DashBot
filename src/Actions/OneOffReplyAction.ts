import { Message, TextChannel } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import DashBot from '../DashBot';
import selectRandom from '../util/selectRandom';

/**
 * A convenience class for all the simple responses that DashBot can do.
 */
export class OneOffReplyAction extends Action {
	private readonly trigger: (message: Message) => boolean;

	/**
	 * Triggers a random reply if the predicate "trigger" returns true
	 */
	constructor(
		bot: DashBot,
		trigger: (message: Message) => boolean,
		replies: (Parameters<TextChannel['sendMessage']>[0] | string)[]
	);
	/**
	 * Triggers a random reply if the received message matches one of the keywords
	 */
	constructor(
		bot: DashBot,
		keywords: string[],
		replies: (Parameters<TextChannel['sendMessage']>[0] | string)[]
	);
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

	async handle(message: Message) {
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
