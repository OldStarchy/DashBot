import Interaction from '../ChatServer/Interaction';
import Message from '../ChatServer/Message';
import DashBot from '../DashBot';
import { Event } from '../Events';
import Tracery from '../tracery/Tracery';

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

/**
 * Could probably be replaced with a OneOffReplyAction.
 */
export default class GreetInteraction implements Interaction {
	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}
	async onMessage(event: Event<Message>) {
		//TODO: Get name from config
		const name = 'DashBot';
		const regexString = `^(oh )?((hey|hi|hello),? )?(there )?(dash|${name})( ?bot)?!?`;
		const message = event.data;
		const { author, textContent, channel } = message;

		const regexObj = new RegExp(regexString, 'i');
		if (regexObj.test(textContent)) {
			event.cancel();
			const greeting = Tracery.generate(
				{
					...GreetingGrammar,
					target: author,
				},
				'greeting'
			);

			channel.sendText(greeting);
		}
	}
}
