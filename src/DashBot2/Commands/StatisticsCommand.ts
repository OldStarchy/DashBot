import StatisticsTracker from '../../StatisticsTracker';
import { formatTable } from '../../util/formatTable';
import { sleep } from '../../util/sleep';
import Command from '../Command';
import Message from '../Message';

export default class StatisticsCommand implements Command {
	constructor(private readonly stats: StatisticsTracker) {}

	async run(message: Message | null) {
		if (message === null) {
			return;
		}

		await message.channel.sendText('Gathering stats...');
		await sleep(1000);

		const stats = await this.stats.getStatistics();
		stats.sort((a, b) => (a.name > b.name ? 1 : -1));

		const r: (string[] | '-' | '=')[] = [['Name', 'Statistic'], '='];

		stats.forEach(stat => {
			r.push([stat.name, stat.statistic.toString()]);
		});

		message.channel.sendText(formatTable(r));
	}
}
