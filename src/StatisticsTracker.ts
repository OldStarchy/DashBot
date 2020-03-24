export interface Statistic {
	name: string;
	statistic: string | number;
}

export interface StatisticProvider {
	getStatistics(): Promise<Statistic[]>;
}

export default class StatisticsTracker {
	private providers: StatisticProvider[] = [];

	public register(provider: StatisticProvider) {
		this.providers.push(provider);
	}

	public async getStatistics() {
		const statistics: Statistic[] = [];

		await Promise.all(
			this.providers.map(async p =>
				statistics.push(...(await p.getStatistics()))
			)
		);

		return statistics;
	}
}
