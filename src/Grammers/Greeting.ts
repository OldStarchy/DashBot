import { RawGrammar } from '../tracery/Grammar';

export const GreetingGrammar: RawGrammar = {
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
