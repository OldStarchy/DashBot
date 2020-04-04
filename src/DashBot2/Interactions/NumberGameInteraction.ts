import StorageRegister from '../../StorageRegister';
import { Tracery } from '../../tracery/Tracery';
import { DashBot2 } from '../DashBot2';
import { Event } from '../Events';
import Interaction from '../Interaction';
import Message from '../Message';
import SessionStore from '../SessionStore';

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

/**
 * Plays the "I'm thinking of a number" game, currently it only thinks of a number, but does not guess your number.
 */
export class NumberGameInteraction implements Interaction {
	private static readonly defaultState: Readonly<NumberGameState> = {
		playing: false,
		number: 0,
		guesses: 0,
	};

	private sessionStore: SessionStore<NumberGameState>;

	constructor(storage: StorageRegister) {
		this.sessionStore = new SessionStore(storage);
	}

	register(bot: DashBot2) {
		bot.on('message', this.onMessage.bind(this));
	}

	async onMessage(event: Event<Message>): Promise<void> {
		const message = event.data;
		if (message === undefined) {
			return;
		}

		const content = message.getTextContent();
		const channel = message.getChannel();
		const author = message.getAuthor();

		const session = this.sessionStore.getSession(message);
		const sessionData = session.getData(
			() => NumberGameInteraction.defaultState
		);

		if (sessionData.playing === false) {
			if (/^i want to guess a number$/i.test(content)) {
				event.cancel();

				const number = Math.floor(Math.random() * 99) + 1;
				//TODO: something like channel.getTag(author) for <!@id> tags in discord
				channel.sendText(
					`OK, @${author.getName()}, I'm thinking of a number between 1 and 100, inclusive`
				);
				sessionData.playing = true;
				sessionData.number = number;
				sessionData.guesses = 0;

				session.setData(sessionData);
			}
		} else {
			if (/^\d+$/.test(content)) {
				const tracery = new Tracery({
					...NumberGuessGrammar,
					target: {
						username: author.getName(),
					},
				});

				event.cancel();

				const guess = Number.parseInt(content);

				if (guess < sessionData.number) {
					const response = tracery.generate('higher');
					channel.sendText(response);
					sessionData.guesses++;
				} else if (guess > sessionData.number) {
					const response = tracery.generate('lower');
					channel.sendText(response);
					sessionData.guesses++;
				} else if (guess === sessionData.number) {
					channel.sendText(
						`You win, you made ${sessionData.guesses} guesses. Well done, you're parents must be proud.`
					);
					sessionData.playing = false;
				}

				session.setData(sessionData);
			}
		}
	}
}
