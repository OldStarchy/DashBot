import { Message } from 'discord.js';
import { Tracery } from '../tracery/Tracery';
import { lazy } from '../util/lazy';
import { OngoingAction } from './OngoingAction';

const HelpActionGrammar = {
	help: ['#greeting#, #description#'],
	greeting: ['Hi #target.username#'],
	description: [
		'I\'m you\'re friendly neighbourhood chatbot. I can do a couple things like give you a "compliment" or "roll D20". If you want, I can DM you some more info.',
	],
	moreInfo: [
		"You're best of reading my readme file over on github.\nhttps://github.com/aNickzz/DashBot#dashbot",
	],
	'ok-no': ['ok :)', 'No problem'],
	'ok-yes': ['Will do', 'ok, 1 sec'],
	//TODO: add grammar for using objects and dot notation instead of just strings.
};

const regex = {
	yes: /^(sure|ye(p|(s( (please|thanks))?)|ah?)|ok)\.?$/i,
	no: /^(no( thanks|pe)?|i'?m (good|fine)( thanks)?)\.?$/i,
};

interface HelpActionSession {
	pendingAnswer: boolean;
	sentMessageTime: number;
}

/**
 * Placeholder help action supposed to give people hints as to what DashBot can do, however due to the "conversational"-like invocation phrases I feel like it doesn't really make sense to just list all the "commands" so not much work has been put in this.
 */
export class HelpAction extends OngoingAction<HelpActionSession> {
	private static defaultSession: Readonly<HelpActionSession> = {
		pendingAnswer: false,
		sentMessageTime: 0,
	};

	async handle(message: Message) {
		const { content, channel, author } = message;
		const helpRegex = /^(\!?help)$/;
		const session = this.getSession(message, HelpAction.defaultSession);

		const tracery = lazy(
			() =>
				new Tracery({
					...HelpActionGrammar,
					target: author,
				})
		);

		if (helpRegex.test(content)) {
			channel.send(tracery().generate('help'));

			session.sentMessageTime = Date.now();
			session.pendingAnswer = true;

			return true;
		}

		const thirtyMinutes = 60 * 30 * 1000;
		if (
			session.pendingAnswer &&
			Date.now() - session.sentMessageTime < thirtyMinutes
		) {
			if (regex.yes.test(content)) {
				(async () => {
					const dmChannel = await author.createDM();
					dmChannel.send(tracery().generate('moreInfo'));
				})();

				channel.send(tracery().generate('ok-yes'));
				session.pendingAnswer = false;
				return true;
			}

			if (regex.no.test(content)) {
				channel.send(tracery().generate('ok-no'));
				session.pendingAnswer = false;
				return true;
			}
		}

		// Didn't reply in time or reply was some other thing.
		if (session.pendingAnswer) session.pendingAnswer = false;

		return false;
	}
}
