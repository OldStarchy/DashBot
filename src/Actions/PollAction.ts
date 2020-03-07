import { Message } from 'discord.js';
import { Action } from '../Action';
import { Tracery } from '../tracery/Tracery';
import Emoji from '../util/emoji';
import parseArguments from '../util/parseArguments';

const grammar = {
	errTooManyArgs: [
		`Sorry <@!#author.id#> I can only do polls with up to #maxAnswers# choices at the moment`,
	],
	maxAnswers: () => PollAction.answersEmoji.length,
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

export class PollAction extends Action {
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

	async handle(message: Message) {
		//TODO: Abstract all commands starting with !
		if (!message.content.startsWith('!poll')) {
			return false;
		}

		const tracery = new Tracery({ ...grammar, author: message.author });
		const args = parseArguments(message.content);

		args.shift(); //first one is '!poll'
		if (args.length === 0) {
			message.channel.send(tracery.generate('helpText'));
			return true;
		}

		if (args.length === 1) {
			//Yes / no poll

			(async () => {
				const msgResult = await message.channel.send(args[0]);
				const msg =
					msgResult instanceof Array ? msgResult[0] : msgResult;

				await msg.react(Emoji.THUMBS_UP);
				await msg.react(Emoji.THUMBS_DOWN);

				if (message.deletable) {
					await message.delete();
				}
			})();

			return true;
		}

		const [question, ...answers] = args;
		if (answers.length > PollAction.answersEmoji.length) {
			message.channel.send(tracery.generate('errTooManyArgs'));
			return true;
		}

		const pollMessage = `${question}${answers
			.map(
				(answer, index) =>
					`\n${PollAction.answersEmoji[index]}: ${answer}`
			)
			.join('')}`;

		(async () => {
			const msgResult = await message.channel.send(pollMessage);
			const msg = msgResult instanceof Array ? msgResult[0] : msgResult;

			for (let i = 0; i < answers.length; i++) {
				await msg.react(PollAction.answersEmoji[i]);
			}
			if (message.deletable) {
				await message.delete();
			}
		})();

		return true;
	}
}
