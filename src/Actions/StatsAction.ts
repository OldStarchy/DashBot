import { Message } from 'discord.js';
import { Action } from '../Action';
import { ActionResult } from '../ActionResult';
import DashBot from '../DashBot';
import StatisticsTracker from '../StatisticsTracker';
import { formatTable } from '../util/formatTable';
import { sleep } from '../util/sleep';

/**
 * Shows some stats. Not many things record stats at the moment. Currently its just a couple things like how many dice rolls and how many imgur searches there have been.
 */
export class StatsAction extends Action {
	constructor(bot: DashBot, private readonly stats: StatisticsTracker) {
		super(bot);
	}

	async handle(message: Message) {
		if (message.content.toLowerCase() === 'show stats') {
			await message.channel.send('Gathering stats...');
			await sleep(1000);

			//#region Gather stats
			const stats = await this.stats.getStatistics();
			stats.sort((a, b) => (a.name > b.name ? 1 : -1));

			const r: string[][] = [['Stat', 'Count']];

			stats.forEach(stat => {
				r.push([stat.name, stat.statistic.toString()]);
			});
			//#endregion

			message.channel.send(formatTable(r));

			return ActionResult.HANDLED;
		}
		return ActionResult.UNHANDLED;
	}
}
