import Interaction from '../ChatServer/Interaction';
import Message from '../ChatServer/Message';
import DashBot from '../DashBot';
import { Event } from '../Events';
import Tracery from '../tracery/Tracery';

type Trigger = string | RegExp | Array<string | RegExp>;
type Response = string | string[];
/**
 * Simple a -> b lookup.
 *
 * ```
 *  new ABMessageAction(this, [
 *  	['a', 'b']
 *  ])
 * ```
 *
 * Eg. If the message is "a" it will respond with "b"
 */
export default class ABResponseInteraction implements Interaction {
	constructor(protected aBResponses: [Trigger, Response][]) {}

	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}
	async onMessage(event: Event<Message>) {
		const message = event.data;

		const content = message.textContent;

		for (const response of this.aBResponses) {
			const triggers =
				response[0] instanceof Array ? response[0] : [response[0]];

			for (const trigger of triggers) {
				if (typeof trigger === 'string') {
					if (trigger === content) {
						message.channel.sendText(
							Tracery.generate(
								{
									origin: response[1],
									author: {
										username: message.author.username,
									},
								},
								'origin'
							)
						);

						event.cancel();
						return;
					}
				} else {
					const match = trigger.exec(content);

					if (match) {
						message.channel.sendText(
							Tracery.generate(
								{
									origin: response[1],
									target: {
										username: message.author.username,
									},
									match: {
										...match.groups,
									},
								},
								'origin'
							)
						);

						event.cancel();
						return;
					}
				}
			}
		}
	}
}
