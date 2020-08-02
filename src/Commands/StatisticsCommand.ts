import Message from '../ChatServer/Message';
import Command from '../Command';
import StatisticsTracker from '../StatisticsTracker';
import formatTable from '../util/formatTable';
import sleep from '../util/sleep';

export default class StatisticsCommand extends Command {
	readonly name = 'stats';
	readonly description = 'Shows statistics';

	constructor(private readonly _stats: StatisticsTracker) {
		super();
	}

	async run(message: Message) {
		await message.channel.sendText('Gathering stats...');
		await sleep(1000);

		const stats = await this._stats.getStatistics();
		stats.sort((a, b) => (a.name > b.name ? 1 : -1));

		const r: (string[] | '-' | '=')[] = [['Name', 'Statistic'], '='];

		stats.forEach(stat => {
			r.push([stat.name, stat.statistic.toString()]);
		});

		message.channel.sendText(formatTable(r));
	}
}
