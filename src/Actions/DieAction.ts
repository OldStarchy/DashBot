import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { sleep } from '../sleep';

export class DieAction extends Action {
	handle(message: Message): ActionResult {
		const match = /^roll (d(-?\d+)|dice)$/i.exec(message.content);

		if (match) {
			let size = 0;
			if (match[1] === 'dice') {
				size = 6;
			} else {
				size = Number.parseInt(match![2]);
			}
			let positive = true;
			if (size === 0) {
				message.channel.send(
					"hey what kind of bot do you take me for, there's no such thing as a " +
						match![1]
				);
				return ActionResult.HANDLED;
			}
			if (size === 1) {
				message.channel.send(
					`something tells me the result of rolling a ${match[1]} would be awfully predictable...`
				);
				return ActionResult.HANDLED;
			}
			this.bot.stats.recordUserTriggeredEvent(
				message.author.username,
				`roll d${size}`
			);
			if (size < 0) {
				size = size * -1;
				positive = false;
			}
			const result = Math.floor(Math.random() * size) + 1;
			message.channel
				.send(
					`@${message.author.username}, rolling a D${(
						size * (positive ? 1 : -1)
					).toFixed(0)}...`
				)
				.then(() => sleep(1000))
				.then(() => {
					if (positive) message.channel.send(result.toFixed(0));
					else message.channel.send('-' + result.toFixed(0));
				});
			return ActionResult.HANDLED;
		}
		if (/^roll (d(-?\d+)e\d+)$/i.test(message.content)) {
			message.channel.send(
				'get out of here with those silly numbers nerd'
			);
			return ActionResult.HANDLED;
		}
		if (/(coin (toss|flip)|(toss|flip) coin)/i.test(message.content)) {
			const size = 11;
			const result = Math.floor(Math.random() * size) + 1;
			this.bot.stats.recordUserTriggeredEvent(
				message.author.username,
				`flip coin`
			);
			message.channel
				.send('@' + message.author.username + ', flipping...')
				.then(() => sleep(1000))
				.then(() => {
					if (result === 11) {
						message.channel.send('Oh no i dropped it :(');
						this.bot.stats.recordUserTriggeredEvent(
							message.author.username,
							`flip coin: coins dropped`
						);
						return;
					}
					message.channel.send(
						((result - 1) % 2) + 1 === 1 ? 'Heads!' : 'Tails!'
					);
					this.bot.stats.recordUserTriggeredEvent(
						message.author.username,
						`flip coin: ${
							((result - 1) % 2) + 1 === 1 ? 'Heads!' : 'Tails!'
						}`
					);
				});
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
