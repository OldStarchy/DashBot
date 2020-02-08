import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { Tracery } from '../tracery/Tracery';
import { escapeSpecialCharacters } from '../util/escapeSpecialCharacters';

const GreetingGrammar = {
	greeting: [
		'Oh, hello #target.username#. :|',
		// "Another one... Please, #target.username#, don't touch anything.",
		// "I hope you'll be more interesting than the others, #target.username#.",
		// "I suppose you'll be expecting me to do some tricks #target.username#. I don't do tricks.",
		"My programming dictates that I respond to you #target.username#, but I won't enjoy it.",
		'Hello #target.username#.',
		'Hi #target.username#.',
		'Hey #target.username#!',
		// "Kon'nichiwa #target.username#-san, kangei.",
		// "Hey #target.username#, glad you're here.",
		// 'Welcome to the room #target.username#.',
		// 'Enjoy your stay #target.username#.',
		// 'Ladies, gentlemen, and non-binaries, I present to you #target.username#.',
		'Oh, you noticed i was here. You are very observant #target.username#',
		'Beep boop... does not compute',
		':eyes:',
		"I'm sorry, my responses are limited. You must ask the right questions.",
	],
};

export class GreetAction extends Action {
	handle(message: Message): ActionResult {
		const name = escapeSpecialCharacters(this.client.user.username);
		const regexString = `^(oh )?((hey|hi|hello),? )?(there )?(dash|${name})( ?bot)?!?`;
		const regexObj = new RegExp(regexString, 'i');
		if (regexObj.test(message.content)) {
			const greeting = Tracery.generate(
				{
					...GreetingGrammar,
					target: message.author,
				},
				'greeting'
			);

			message.channel.send(greeting);
			return ActionResult.HANDLED;
		}

		return ActionResult.UNHANDLED;
	}
}
