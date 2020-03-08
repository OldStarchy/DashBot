import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { AdventurerIntroduction } from '../Grammars/AdventurerIntroduction';
import { DefaultModifiersEn } from '../tracery/default/modifiers-en';
import { Tracery } from '../tracery/Tracery';

const tracery = new Tracery(AdventurerIntroduction);

tracery.addModifiers(DefaultModifiersEn);
/**
 * Preliminary action for expanding a tracery grammar when triggered. Could be combined with OneOffReplyAction or ABResponseAction
 */
export class TraceryAction extends Action {
	async handle(message: Message) {
		if (/who am i/i.test(message.content)) {
			const generated = tracery.generate('origin');

			message.channel.send('> ' + generated);
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
