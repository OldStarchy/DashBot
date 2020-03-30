import { Tracery } from '../../tracery/Tracery';
import Emoji from '../../util/emoji';
import Command from '../Command';
import Message from '../Message';

const grammar = {
	errTooManyArgs: [
		`Sorry <@!#author.getId#> I can only do polls with up to #maxAnswers# choices at the moment`,
	],
	maxAnswers: () => PollCommand.answersEmoji.length,
	helpText: [
		[
			'To start a poll use "!poll question" for a yes/no choice or "!poll question answer1 "answer 2"',
			'Eg. `#example#`',
		].join('\n'),
	],
	example: [
		'!poll "What to play?" "Rocket League" Overwatch Factorio Minecraft',
		'!poll "What should I eat for dinner?" Food',
		'!poll "Is everyone having fun?"',
	],
};

/**
 * Allows you to create polls (much like other existing poll bots).
 *
 * `!poll "this is my question" yes no maybe "i don't know".`
 */
export default class PollCommand implements Command {
	static readonly answersEmoji = [
		Emoji.ZERO,
		Emoji.ONE,
		Emoji.TWO,
		Emoji.THREE,
		Emoji.FOUR,
		Emoji.FIVE,
		Emoji.SIX,
		Emoji.SEVEN,
		Emoji.EIGHT,
		Emoji.NINE,
		Emoji.TEN,
	];

	async run(message: Message, _: string, ...args: string[]) {
		if (message === null) {
			return;
		}
		const channel = message.getChannel();
		if (!channel.getSupportsReactions()) {
			await channel.sendText("This chat does't support polls");
			return;
		}

		const tracery = new Tracery({ ...grammar, author: message.getAuthor });

		if (args.length === 0) {
			channel.sendText(tracery.generate('helpText'));
			return;
		}

		if (args.length === 1) {
			//Yes / no poll

			const msg = await channel.sendText(args[0]);

			if (msg) {
				await msg.react(Emoji.THUMBS_UP);
				await msg.react(Emoji.THUMBS_DOWN);
			}

			return;
		}

		const [question, ...answers] = args;
		if (answers.length > PollCommand.answersEmoji.length) {
			channel.sendText(tracery.generate('errTooManyArgs'));
			return;
		}

		const pollMessage = `${question}${answers
			.map(
				(answer, index) =>
					`\n${PollCommand.answersEmoji[index]}: ${answer}`
			)
			.join('')}`;

		const msg = await channel.sendText(pollMessage);

		if (msg) {
			for (let i = 0; i < answers.length; i++) {
				await msg.react(PollCommand.answersEmoji[i]);
			}
		}
	}
}
