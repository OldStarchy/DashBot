export interface Statistic {
	name: string;
	statistic: string | number;
}

export interface StatisticProvider {
	getStatistics(): Promise<Statistic[]>;
}

export default class StatisticsTracker {
	private readonly _providers: StatisticProvider[] = [];

	public register(provider: StatisticProvider) {
		this._providers.push(provider);
	}

	public async getStatistics() {
		const statistics: Statistic[] = [];

		await Promise.all(
			this._providers.map(async p =>
				statistics.push(...(await p.getStatistics()))
			)
		);

		return statistics;
	}
}
