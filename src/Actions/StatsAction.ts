import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import { formatTable } from '../formatTable';
import { sleep } from '../sleep';

export class StatsAction extends Action {
	handle(message: Message) {
		if (message.content.toLowerCase() === 'show stats') {
			message.channel
				.send('Gathering stats...')
				.then(f => sleep(1000))
				.then(f => {
					this.bot.stats.recordUserTriggeredEvent(
						message.author.username,
						'request stats'
					);
					const stats = this.bot.stats.events;
					const keys = Object.keys(stats).sort();
					let r: string[][] = [['Stat', 'Count']];
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
					message.channel.send(formatTable(r));
				});
			return ActionResult.HANDLED;
		}
		if (message.content.toLowerCase() === 'show my stats') {
			message.channel
				.send(`Gathering stats for ${message.author.username}...`)
				.then(f => sleep(1000))
				.then(f => {
					this.bot.stats.recordUserTriggeredEvent(
						message.author.username,
						'request stats'
					);
					const stats =
						this.bot.stats.userTriggeredEvents[
							message.author.username
						] || {};
					const keys = Object.keys(stats).sort();
					let r: string[][] = [['Stat', 'Count']];
					keys.forEach(key => {
						r.push([
							`${key}`,
							`${stats[key]} time${stats[key] === 1 ? '' : 's'}`,
						]);
					});
					message.channel.send(formatTable(r));
				});
			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
