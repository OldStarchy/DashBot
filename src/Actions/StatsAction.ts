import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { formatTable } from '../util/formatTable';
import { sleep } from '../util/sleep';

export class StatsAction extends Action {
	async handle(message: Message) {
		if (message.content.toLowerCase() === 'show stats') {
			await message.channel.send('Gathering stats...');
			await sleep(1000);

			//#region Gather stats
			this.bot.stats.recordUserTriggeredEvent(
				message.author.username,
				'request stats'
			);
			const stats = this.bot.stats.events;
			const keys = Object.keys(stats).sort();
			const r: string[][] = [['Stat', 'Count']];
			r.push([
				'time since last nap',
				(
					(Date.now() - this.bot.stats.startTrackingTime) /
					1000
				).toFixed(0) + ' seconds',
			]);
			keys.forEach(key => {
				r.push([
					`${key}`,
					`${stats[key]} time${stats[key] === 1 ? '' : 's'}`,
				]);
			});
			//#endregion

			message.channel.send(formatTable(r));

			return ActionResult.HANDLED;
		}
		if (message.content.toLowerCase() === 'show my stats') {
			await message.channel.send(
				`Gathering stats for ${message.author.username}...`
			);
			await sleep(1000);

			this.bot.stats.recordUserTriggeredEvent(
				message.author.username,
				'request stats'
			);
			const stats =
				this.bot.stats.userTriggeredEvents[message.author.username] ||
				{};
			const keys = Object.keys(stats).sort();
			const r: string[][] = [['Stat', 'Count']];
			keys.forEach(key => {
				r.push([
					`${key}`,
					`${stats[key]} time${stats[key] === 1 ? '' : 's'}`,
				]);
			});
			message.channel.send(formatTable(r));
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
