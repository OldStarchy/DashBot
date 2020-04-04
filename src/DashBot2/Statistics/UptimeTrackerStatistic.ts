import { StatisticProvider } from '../../StatisticsTracker';

export default class UptimeTrackerStatistic implements StatisticProvider {
	constructor(private _target: { getUptime: () => number }) {}

	async getStatistics() {
		let seconds = this._target.getUptime() / 1000;
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;
		let hours = Math.floor(minutes / 60);
		minutes -= hours * 60;
		const days = Math.floor(hours / 24);
		hours -= days * 24;

		const s = (n: number) => (n === 1 ? '' : 's');

		const parts = [];
		if (days > 0) {
			parts.push(`${days.toFixed(0)} day${s(days)}`);
		}
		if (hours > 0) {
			parts.push(`${hours.toFixed(0)} hour${s(hours)}`);
		}
		if (minutes > 0) {
			parts.push(`${minutes.toFixed(0)} minute${s(minutes)}`);
		}
		if (seconds > 0) {
			parts.push(`${seconds.toFixed(0)} second${s(seconds)}`);
		}

		let statistic: string;

		if (parts.length === 1) statistic = parts.join('');
		else if (parts.length === 2) statistic = parts.join(' and ');
		else
			statistic =
				parts.slice(0, -1).join(', ') + ', and ' + parts.slice(-1);

		return [
			{
				name: 'Time since last nap',
				statistic,
			},
		];
	}
}
