export default class DateStringParser {
	private static readonly timeOfDay: Record<string, string> = {
		'': '09:00',
		morning: '09:00',
		noon: '12:00',
		'lunch time': '12:00',
		afternoon: '15:00',
		evening: '18:00',
		night: '22:00',
		midnight: '23:59:59',
	};

	private static readonly secondMs = 1000;
	private static readonly minuteMs = 60 * DateStringParser.secondMs;
	private static readonly hourMs = 60 * DateStringParser.minuteMs;
	private static readonly dayMs = 24 * DateStringParser.hourMs;
	private static readonly weekMs = 7 * DateStringParser.dayMs;

	/**
	 * Tries to parse a string representing a time, eg. "2020-12-11", "at 4pm", or "in 30 days".
	 */
	static tryParse(
		str: string,
		now?: number
	): { time: number | null; remainingStr: string } {
		const _now = now || Date.now();
		const _today = new Date(_now).setHours(0, 0, 0, 0);
		const _time = _now - _today;

		let date: number | null = null;
		let time: number | null = null;

		const ymdParser = ({
			year: y,
			month: m,
			date: d,
		}: Record<string, string>) =>
			(date = new Date(
				Number.parseInt(y),
				Number.parseInt(m) - 1,
				Number.parseInt(d)
			).getTime());

		const hmspParser = ({
			hours: h,
			minutes: i,
			seconds: s,
			ampm,
		}: Record<string, string>) => {
			let hr = Number.parseInt(h);
			if (ampm !== undefined) {
				if (hr === 0 || hr > 12) throw new Error('Invalid hour');
				if (ampm === 'am') {
					if (hr === 12) hr = 0;
				} else {
					if (hr === 12) hr = 0;
					hr += 12;
				}
			}
			time =
				hr * DateStringParser.hourMs +
				(i ? Number.parseInt(i) * DateStringParser.minuteMs : 0) +
				(s ? Number.parseInt(s) * DateStringParser.secondMs : 0);

			if (date === null) {
				if (time < _now) {
					date = _today + DateStringParser.dayMs;
				}
			}
		};

		const dateFormats = [
			{
				regex: /^(?<year>\d+)-(?<month>\d+)-(?<date>\d+)/,
				parser: ymdParser,
			},
			{
				regex: /^(?<date>\d+)\/(?<month>\d+)\/(?<year>\d+)/,
				parser: ymdParser,
			},
			{
				regex: /^today/,
				parser: () => (date = _today),
			},
			{
				regex: /^tomorrow/,
				parser: () => (date = _today + DateStringParser.dayMs),
			},
			{
				regex: /^yesterday/,
				parser: () => (date = _today - DateStringParser.dayMs),
			},
			{
				regex: /^(?<nOrL>next|last) (?<period>week|month|fortnight|year)/,
				parser: ({ nOrL, period }: Record<string, string>) => {
					const scale = nOrL.toLowerCase() === 'next' ? 1 : -1;

					switch (period.toLowerCase()) {
						case 'year':
							date = new Date(_today).setFullYear(
								new Date(_today).getFullYear() + scale
							);
							return;
						case 'month':
							date = new Date(_today).setMonth(
								new Date(_today).getMonth() + scale
							);
							return;
						case 'fortnight':
							date = _today + DateStringParser.weekMs * 2 * scale;
							return;
						case 'week':
							date = _today + DateStringParser.weekMs * scale;
							return;
					}
				},
			},
			{
				regex: /^now/,
				parser: () => ((date = _today), (time = _time)),
			},
			{
				regex: /^in(?<offsets>(?: (?:\d+) (?:hour|minute|second)s?(?: (?:and|,))?)+)/,
				parser: ({ offsets }: Record<string | number, string>) => {
					if (date !== null)
						throw new Error('Relative time used with date');

					time = _time + this.parseHmsText(offsets);
				},
			},
			{
				regex: /^(?<offsets>(?:(?:\d+) (?:hour|minute|second)s?(?: (?:and|,))?)+) ago/,
				parser: ({ offsets }: Record<string | number, string>) => {
					if (date !== null)
						throw new Error('Relative time used with date');

					time = _time - this.parseHmsText(offsets);
				},
			},
			{
				regex: /^(?:at )?(?<hours>\d+)(?::(?<minutes>\d+)(?::(?<seconds>\d+))?)?(?<ampm>am|pm)?/,
				parser: hmspParser,
			},
		];

		wh: while (str.length > 0) {
			for (const matcher of dateFormats) {
				const match = matcher.regex.exec(str);
				if (match) {
					matcher.parser(match.groups!);

					str = str.substr(match[0].length).trim();
					continue wh;
				}
			}
			break;
		}

		if (date === null && time === null)
			return { time: null, remainingStr: str };
		return { time: (date ?? _today)! + (time ?? 0)!, remainingStr: str };
	}

	private static parseHmsText(str: string) {
		const regex = /(?<amount>\d+) (?<unit>hour|minute|second)s?(?: (?:and|,))?/g;

		let match = null;
		let total = 0;
		while ((match = regex.exec(str)) !== null) {
			const { amount, unit } = match.groups!;
			switch (unit) {
				case 'hour':
					total += Number.parseInt(amount) * DateStringParser.hourMs;
					break;
				case 'minute':
					total +=
						Number.parseInt(amount) * DateStringParser.minuteMs;
					break;
				case 'second':
					total +=
						Number.parseInt(amount) * DateStringParser.secondMs;
					break;
			}
		}
		return total;
	}
	public static getTimeDiffString(diff: number) {
		diff /= 1000;

		if (diff + 5 < 10) {
			return 'now';
		}

		const minutes = Math.round(diff / 60);

		if (minutes < 60) {
			return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
		}

		const hours = Math.round(diff / (60 * 60));

		if (hours < 25) {
			return `in ${hours} hour${hours === 1 ? '' : 's'}`;
		}

		let days = Math.round(diff / (60 * 60 * 24));

		if (days < 7) {
			return `in ${days} day${days === 1 ? '' : 's'}`;
		}

		if (days > 7) {
			const weeks = Math.floor(days / 7);
			days = days - weeks * 7;

			let str = `in ${weeks} week${weeks != 1 ? 's' : ''}`;

			if (days > 0) {
				str += ` and ${days} day${days != 1 ? 's' : ''}`;
			}

			return str;
		}
	}
}
