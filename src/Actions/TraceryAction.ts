import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { Tracery } from '../tracery/Tracery';
import { Grammar } from '../tracery/Grammar';
import { DefaultModifiersEn } from '../tracery/default/modifiers-en';
import { AdventurerIntroduction } from '../Grammers/AdventurerIntroduction';

const tracery = new Tracery();

export class TraceryAction extends Action {
	handle(message: Message) {
		if (/who am i/i.test(message.content)) {
			const grammar = tracery.createGrammar(AdventurerIntroduction);
			grammar.addModifiers(DefaultModifiersEn);

			const generated = grammar.expand('#origin#');

			message.channel.send('> ' + generated.finishedText);
			return new ActionResult(true);
		}
		return new ActionResult(false);
	}
}
