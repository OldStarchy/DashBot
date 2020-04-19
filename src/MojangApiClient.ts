import fetch from 'node-fetch';

type QueryData = Record<string, string>;

type UserData = {
	id: string;
	name: string;
	legacy?: true;
	demo?: true;
};

type NameHistory = {
	name: string;
	changedToAt?: number;
}[];

/**
 * A couple of endpoints from https://wiki.vg/Mojang_API
 */
export default class MojangApiClient {
	static readonly BASE_URL = 'https://api.mojang.com';

	async getUuidFromUsername(username: string, timestamp?: number) {
		const query: QueryData = {};
		if (timestamp !== undefined) {
			query.at = timestamp.toString();
		}

		return await this.get<UserData>(
			'/users/profiles/minecraft/' + encodeURIComponent(username),
			query
		);
	}

	async getUsernameHistory(id: string) {
		return await this.get<NameHistory>(
			`/user/profiles/${id.replace(/\-/g, '')}/names`
		);
	}

	private async get<T>(
		url: string,
		query?: Record<string, string>
	): Promise<T | null> {
		const queryString = query
			? Object.keys(query)
					.map(
						key =>
							encodeURIComponent(key) +
							'=' +
							encodeURIComponent(query[key])
					)
					.join('&')
			: '';

		const response = await fetch(
			MojangApiClient.BASE_URL +
				url +
				(queryString === '' ? '' : `?${queryString}`),
			{
				headers: [
					['Accept', ' application/json'],
					[
						'User-Agent',
						'DashBot Discord Bot (https://github.com/aNickzz/DashBot)',
					],
				],
			}
		);

		if (response.status === 200) {
			return (await response.json()) as T;
		} else {
			return null;
		}
	}
}
