import StorageRegister from '../../StorageRegister';
import { Tracery } from '../../tracery/Tracery';
import { lazy } from '../../util/lazy';
import Command from '../Command';
import { DashBot2 } from '../DashBot2';
import { Event } from '../Events';
import Interaction from '../Interaction';
import Message from '../Message';
import SessionStore from '../SessionStore';

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
	//TODO: add grammar for using objects and dot notation instead of just strings.
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
export class HelpCommand implements Command, Interaction {
	private static readonly defaultSession: Readonly<HelpCommandSession> = {
		pendingAnswer: false,
		sentMessageTime: 0,
	};

	private readonly _session: SessionStore<HelpCommandSession>;

	constructor(private storage: StorageRegister) {
		this._session = new SessionStore(storage);
	}

	async run(
		message: Message | null
		// name: string,
		// ...args: string[]
	): Promise<void> {
		if (message == null) return;

		const content = message.textContent;
		const channel = message.channel;
		const author = message.author;

		const helpRegex = /^(\!?help)$/;
		const sessionStore = this._session.getSession(message);
		const session = sessionStore.getData(() => HelpCommand.defaultSession);

		const tracery = lazy(
			() =>
				new Tracery({
					...HelpCommandGrammar,
					target: {
						username: author.username,
					},
				})
		);

		if (helpRegex.test(content)) {
			channel.sendText(tracery().generate('help'));

			session.sentMessageTime = Date.now();
			session.pendingAnswer = true;

			sessionStore.setData(session);
			return;
		}

		const thirtyMinutes = 60 * 30 * 1000;
		if (
			session.pendingAnswer &&
			Date.now() - session.sentMessageTime < thirtyMinutes
		) {
			if (regex.yes.test(content)) {
				const dmChannel = await author
					.getPerson()
					.getPrivateTextChannel(author.getServer());

				if (dmChannel) {
					await channel.sendText(tracery().generate('ok-yes'));
					await dmChannel.sendText(tracery().generate('moreInfo'));
				} else {
					await channel.sendText(
						tracery().generate('no-private-chat')
					);
				}

				session.pendingAnswer = false;
			} else if (regex.no.test(content)) {
				await channel.sendText(tracery().generate('ok-no'));
				session.pendingAnswer = false;
			} else {
				return;
			}

			sessionStore.setData(session);
			return;
		}

		// Didn't reply in time or reply was some other thing.
		if (session.pendingAnswer) session.pendingAnswer = false;
		sessionStore.setData(session);
	}

	private async onMessage(event: Event<Message>) {
		await this.run(event.data);
	}

	register(bot: DashBot2) {
		bot.on('message', this.onMessage.bind(this));
	}
}
