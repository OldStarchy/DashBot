import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { AdventurerIntroduction } from '../Grammars/AdventurerIntroduction';
import { DefaultModifiersEn } from '../tracery/default/modifiers-en';
import { Tracery } from '../tracery/Tracery';

const tracery = new Tracery(AdventurerIntroduction);

tracery.addModifiers(DefaultModifiersEn);
export class TraceryAction extends Action {
	handle(message: Message): ActionResult {
		if (/who am i/i.test(message.content)) {
			const generated = tracery.generate('origin');

			message.channel.send('> ' + generated);
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
