import Interaction from '../ChatServer/Interaction';
import Message from '../ChatServer/Message';
import Command from '../Command';
import DashBot from '../DashBot';
import { EventForEmitter } from '../Events';
import SessionStore from '../SessionStore';
import StorageRegister from '../StorageRegister';
import Tracery from '../tracery/Tracery';
import lazy from '../util/lazy';

const HelpCommandGrammar = {
	help: ['#greeting#, #description#'],
	greeting: ['Hi #target.username#'],
	description: [
		'I\'m you\'re friendly neighbourhood chatbot. I can do a couple things like give you a "compliment" or "roll D20". If you want, I can DM you some more info.',
	],
	moreInfo: [
		"You're best off reading my readme file over on github.\nhttps://github.com/aNickzz/DashBot\\#dashbot",
	],
	'ok-no': ['OK :)', 'No problem'],
	'ok-yes': ['Will do', 'OK, 1 sec'],
	'no-private-chat': [
		"I couldn't find a private chat I could use to DM you.",
	],
};

const regex = {
	yes: /^(sure|ye(p|(s( (please|thanks))?)|ah?)|ok)\.?$/i,
	no: /^(no( thanks|pe)?|i'?m (good|fine)( thanks)?)\.?$/i,
};

interface HelpCommandSession {
	pendingAnswer: boolean;
	sentMessageTime: number;
}

/**
 * Placeholder help action supposed to give people hints as to what DashBot can do, however due to the "conversational"-like invocation phrases I feel like it doesn't really make sense to just list all the "commands" so not much work has been put in this.
 */
export default class HelpCommand extends Command implements Interaction {
	readonly name = 'help';
	readonly description = 'Shows help for available commands';

	private static readonly defaultSession: Readonly<HelpCommandSession> = {
		pendingAnswer: false,
		sentMessageTime: 0,
	};

	private readonly _session: SessionStore<HelpCommandSession>;

	constructor(private storage: StorageRegister) {
		super();
		this._session = new SessionStore(storage);
	}

	async run(message: Message): Promise<void> {
		const { textContent, channel, author } = message;

		const helpRegex = /^(\!?help)$/;
		const sessionStore = this._session.getSession(message);
		const session = sessionStore.getData(() => HelpCommand.defaultSession);

		const tracery = lazy(
			() =>
				new Tracery({
					...HelpCommandGrammar,
					target: author,
				})
		);

		if (helpRegex.test(textContent)) {
			channel.sendText(tracery().generate('help'));

			sessionStore.setData({
				sentMessageTime: Date.now(),
				pendingAnswer: true,
			});
			return;
		}

		const thirtyMinutes = 60 * 30 * 1000;
		if (
			session.pendingAnswer &&
			Date.now() - session.sentMessageTime < thirtyMinutes
		) {
			if (regex.yes.test(textContent)) {
				const dmChannel = await (
					await author.getPerson()
				).getPrivateTextChannel(author.server);

				if (dmChannel) {
					await channel.sendText(tracery().generate('ok-yes'));
					await dmChannel.sendText(tracery().generate('moreInfo'));
				} else {
					await channel.sendText(
						tracery().generate('no-private-chat')
					);
				}
			} else if (regex.no.test(textContent)) {
				await channel.sendText(tracery().generate('ok-no'));
			} else {
				return;
			}

			sessionStore.clearData();
			return;
		}

		// Didn't reply in time or reply was some other thing.
		if (session.pendingAnswer) sessionStore.clearData();
	}

	private async onMessage(event: EventForEmitter<DashBot, 'message'>) {
		await this.run(event.data);
	}

	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}
}
