import Message from '../ChatServer/Message';
import Command from '../Command';
import Tracery from '../tracery/Tracery';
import selectRandom from '../util/selectRandom';

const grammar = {
	helpText: ["Give me some options and I'll pick one randomly."],
	example: ['!pick "Rocket League" Overwatch Factorio Minecraft'],
	answer: [
		'Hmm, I choose "#choice#.',
		'"#choice#"! Definitely.',
		'I really think the answer is "#choice#".',
	],

	answer1: [
		'I\'m really not sure, but I think "#choice#"',
		'Really? "#choice#" it is then...',
	],
};

/**
 * Allows you to create polls (much like other existing poll bots).
 *
 * `!poll "this is my question" yes no maybe "i don't know".`
 */
export default class PickCommand implements Command {
	async run(message: Message, _: string, ...args: string[]) {
		if (message === null) {
			return;
		}
		const channel = message.channel;
		const tracery = new Tracery({ ...grammar, author: message.author });

		if (args.length === 0) {
			channel.sendText(tracery.generate('helpText'));
			return;
		}

		const pick = selectRandom(args);

		await channel.sendText(
			Tracery.generate(
				{
					...grammar,
					choice: Tracery.escape(pick),
				},
				args.length === 1 ? 'answer1' : 'answer'
			)
		);
	}
}
