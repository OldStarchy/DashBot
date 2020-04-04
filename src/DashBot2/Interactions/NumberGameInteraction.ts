import StorageRegister from '../../StorageRegister';
import Tracery from '../../tracery/Tracery';
import DashBot2 from '../DashBot2';
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
export default class NumberGameInteraction implements Interaction {
	private static readonly defaultState: Readonly<NumberGameState> = {
		playing: false,
		number: 0,
		guesses: 0,
	};

	private _sessionStore: SessionStore<NumberGameState>;

	constructor(storage: StorageRegister) {
		this._sessionStore = new SessionStore(storage);
	}

	register(bot: DashBot2) {
		bot.on('message', this.onMessage.bind(this));
	}

	async onMessage(event: Event<Message>): Promise<void> {
		const message = event.data;
		if (message === undefined) {
			return;
		}

		const { textContent, channel, author } = message;

		const session = this._sessionStore.getSession(message);
		const sessionData = session.getData(
			() => NumberGameInteraction.defaultState
		);

		if (sessionData.playing === false) {
			if (/^i want to guess a number$/i.test(textContent)) {
				event.cancel();

				const number = Math.floor(Math.random() * 99) + 1;
				//TODO: something like channel.getTag(author) for <!@id> tags in discord
				channel.sendText(
					`OK, @${author.username}, I'm thinking of a number between 1 and 100, inclusive`
				);

				session.setData({
					...sessionData,
					playing: true,
					number: number,
					guesses: 0,
				});
			}
		} else {
			if (/^\d+$/.test(textContent)) {
				const tracery = new Tracery({
					...NumberGuessGrammar,
					target: author,
				});

				event.cancel();

				const guess = Number.parseInt(textContent);

				if (guess < sessionData.number) {
					const response = tracery.generate('higher');
					channel.sendText(response);
					session.setData({
						...sessionData,
						guesses: sessionData.guesses + 1,
					});
					return;
				}

				if (guess > sessionData.number) {
					const response = tracery.generate('lower');
					channel.sendText(response);
					session.setData({
						...sessionData,
						guesses: sessionData.guesses + 1,
					});
					return;
				}

				if (guess === sessionData.number) {
					channel.sendText(
						`You win, you made ${sessionData.guesses} guesses. Well done, you're parents must be proud.`
					);
					session.clearData();
					return;
				}
			}
		}
	}
}
