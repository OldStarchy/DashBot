import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { GreetingGrammar } from '../Grammars/Greeting';
import { expandTracery } from '../tracery/expandTracery';

export class GreetAction extends Action {
	handle(message: Message): ActionResult {
		if (
			/^(oh )?((hey|hi|hello),? )?(there )?dash( ?bot)?!?/i.test(
				message.content
			)
		) {
			const greeting = expandTracery('greeting', {
				...GreetingGrammar,
				'target.username': message.author.username,
			});

			message.channel.send(greeting);
			return ActionResult.HANDLED;
		}

		return ActionResult.UNHANDLED;
	}
}
