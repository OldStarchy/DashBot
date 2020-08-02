import Interaction from '../ChatServer/Interaction';
import DashBot from '../DashBot';
import { EventForEmitter } from '../Events';
import sleep from '../util/sleep';

/**
 * Rolls dice and flips coins.
 *
 * `roll dice`
 *
 * `roll d20`
 *
 * `roll d100000`
 *
 * `flip coin`
 */
export default class DieInteraction implements Interaction {
	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}

	async onMessage(event: EventForEmitter<DashBot, 'message'>) {
		const message = event.data;

		const { textContent, author, channel } = message;

		const match = /^roll (d(-?\d+)|dice)$/i.exec(textContent);

		if (match) {
			event.cancel();

			let size = 0;
			if (match[1] === 'dice') {
				size = 6;
			} else {
				size = Number.parseInt(match![2]);
			}
			let positive = true;
			if (size === 0) {
				channel.sendText(
					"hey what kind of bot do you take me for, there's no such thing as a " +
						match![1]
				);
				return;
			}
			if (size === 1) {
				channel.sendText(
					`something tells me the result of rolling a ${match[1]} would be awfully predictable...`
				);
				return;
			}
			// this.bot.stats.recordUserTriggeredEvent(
			// 	author.username,
			// 	`roll d${size}`
			// );
			if (size < 0) {
				size = size * -1;
				positive = false;
			}
			const result = Math.floor(Math.random() * size) + 1;

			(async () => {
				await channel.sendText(
					`@${author.username}, rolling a D${(
						size * (positive ? 1 : -1)
					).toFixed(0)}...`
				);

				await sleep(1000);

				if (positive) channel.sendText(result.toFixed(0));
				else channel.sendText('-' + result.toFixed(0));
			})();

			return;
		}

		if (/^roll (d(-?\d+)e\d+)$/i.test(textContent)) {
			event.cancel();
			channel.sendText('get out of here with those silly numbers nerd');

			return;
		}

		if (/(coin (toss|flip)|(toss|flip) coin)/i.test(textContent)) {
			event.cancel();
			const size = 11;
			const result = Math.floor(Math.random() * size) + 1;
			// this.bot.stats.recordUserTriggeredEvent(
			// 	author.username,
			// 	`flip coin`
			// );
			channel
				.sendText('@' + author.username + ', flipping...')
				.then(() => sleep(1000))
				.then(() => {
					if (result === 11) {
						channel.sendText('Oh no i dropped it :(');
						// this.bot.stats.recordUserTriggeredEvent(
						// 	author.username,
						// 	`flip coin: coins dropped`
						// );
						return;
					}
					channel.sendText(
						((result - 1) % 2) + 1 === 1 ? 'Heads!' : 'Tails!'
					);
					// this.bot.stats.recordUserTriggeredEvent(
					// 	author.username,
					// 	`flip coin: ${
					// 		((result - 1) % 2) + 1 === 1 ? 'Heads!' : 'Tails!'
					// 	}`
					// );
				});

			return;
		}
	}
}
