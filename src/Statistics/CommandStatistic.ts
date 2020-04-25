import DashBot, { BeforeRunCommandData } from '../DashBot';
import { Event } from '../Events';
import { Statistic, StatisticProvider } from '../StatisticsTracker';
import StorageRegister, { PersistentData } from '../StorageRegister';

interface CommandStatisticData {
	[commandName: string]: number;
}
export default class CommandStatistic implements StatisticProvider {
	private static readonly defaultData: CommandStatisticData = {};
	private _store: PersistentData<CommandStatisticData>;

	constructor(storage: StorageRegister, bot: DashBot) {
		this._store = storage.createStore('CommandStatistic', false);
		bot.on('beforeRunCommand', this.onBeforeRunCommand.bind(this));
	}

	private getData() {
		return this._store.getData(() => CommandStatistic.defaultData);
	}

	private onBeforeRunCommand(event: Event<BeforeRunCommandData>) {
		switch (event.data.name) {
			case 'disconnect':
			case 'minecraft':
			case 'echo':
			case 'pet':
				return;
			default:
				this.recordCommand(event.data.name);
		}
	}

	recordCommand(name: string) {
		const data = this.getData();

		const count = (data[name] || 0) + 1;

		this._store.setData({
			...data,
			[name]: count,
		});
	}

	async getStatistics() {
		const data = this.getData();
		const statistics: Statistic[] = Object.keys(data).map(name => ({
			name: `"${name}" command invocations`,
			statistic: data[name].toString(),
		}));

		return statistics;
	}
}
