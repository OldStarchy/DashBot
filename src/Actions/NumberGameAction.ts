import { Message } from 'discord.js';
import { Tracery } from '../tracery/Tracery';
import { OngoingAction } from './OngoingAction';

interface NumberGameState {
	playing: boolean;
	number: number;
	guesses: number;
}

const NumberGuessGrammar = {
	higher: [
		'Nope, higher',
		"Wrong you're too low",
		"Sorry #target.username#, that number is no the number I'm thinking of. You need to guess a higher number",
	],
	lower: ['Nope, lower'],
};

export class NumberGameAction extends OngoingAction<NumberGameState> {
	private static readonly defaultState: Readonly<NumberGameState> = {
		playing: false,
		number: 0,
		guesses: 0,
	};
	handle(message: Message): boolean {
		const session = this.getSession(message, NumberGameAction.defaultState);
		if (session.playing === false) {
			if (/^i want to guess a number$/i.test(message.content)) {
				const number = Math.floor(Math.random() * 99) + 1;
				message.channel.send(
					`OK, @${message.author}, I'm thinking of a number between 1 and 100, inclusive`
				);
				session.playing = true;
				session.number = number;
				session.guesses = 0;
				return true;
			}
			return false;
		} else {
			const tracery = new Tracery({
				...NumberGuessGrammar,
				target: message.author,
			});

			if (/^\d+$/.test(message.content)) {
				const guess = Number.parseInt(message.content);

				if (guess < session.number) {
					const response = tracery.generate('higher');
					message.channel.send(response);
					session.guesses++;

					return true;
				}

				if (guess > session.number) {
					const response = tracery.generate('lower');
					message.channel.send(response);
					session.guesses++;

					return true;
				}

				if (guess === session.number) {
					message.channel.send(
						`You win, you made ${session.guesses} guesses. Well done, you're parents must be proud.`
					);
					session.playing = false;

					return true;
				}
			}
		}
		return false;
	}
}
