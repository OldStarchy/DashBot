import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { AdventurerIntroduction } from '../Grammers/AdventurerIntroduction';
import { DefaultModifiersEn } from '../tracery/default/modifiers-en';
import { Tracery } from '../tracery/Tracery';

const tracery = new Tracery();

export class TraceryAction extends Action {
	handle(message: Message) {
		if (/who am i/i.test(message.content)) {
			const grammar = tracery.createGrammar(AdventurerIntroduction);
			grammar.addModifiers(DefaultModifiersEn);

			const generated = grammar.expand('#origin#');

			message.channel.send('> ' + generated.finishedText);
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
