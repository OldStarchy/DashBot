import { DateTime, DurationObjectUnits } from 'luxon';

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

	// private static readonly TIMEZONE = 'Australia/Adelaide';
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
		now?: DateTime,
		timezone?: string
	): { time: number | null; remainingStr: string } {
		const _now = now || DateTime.utc().setZone(timezone ?? 'utc');
		let targetTime = DateTime.utc().setZone(timezone ?? 'utc');

		let dateFound = false;
		let timeFound = false;

		const ymdParser = ({
			year: y,
			month: m,
			date: d,
		}: Record<string, string>) => {
			targetTime = targetTime
				.set({
					year: Number.parseInt(y),
					month: Number.parseInt(m),
					day: Number.parseInt(d),
				})
				.startOf('day');
			dateFound = true;
		};

		const hmspParser = ({
			hours: h,
			minutes: i,
			seconds: s,
			amPm,
		}: Record<string, string>) => {
			let hr = Number.parseInt(h);
			if (amPm !== undefined) {
				if (hr === 0 || hr > 12) throw new Error('Invalid hour');
				if (amPm === 'am') {
					if (hr === 12) hr = 0;
				} else {
					if (hr === 12) hr = 0;
					hr += 12;
				}
			}
			targetTime = targetTime.set({
				hour: hr,
				minute: i ? Number.parseInt(i) : 0,
				second: s ? Number.parseInt(s) : 0,
			});

			if (!dateFound) {
				if (targetTime < _now) {
					targetTime = targetTime.plus({ days: 1 });
				}
			}

			timeFound = true;
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
				parser: () => {
					targetTime = targetTime.startOf('day');
					dateFound = true;
				},
			},
			{
				regex: /^tomorrow/,
				parser: () => {
					targetTime = targetTime.startOf('day').plus({ days: 1 });
					dateFound = true;
				},
			},
			{
				regex: /^yesterday/,
				parser: () => {
					targetTime = targetTime.startOf('day').minus({ days: 1 });
					dateFound = true;
				},
			},
			{
				regex: /^(?<nOrL>next|last) (?<period>week|month|fortnight|year)/,
				parser: ({ nOrL, period }: Record<string, string>) => {
					const scale = nOrL.toLowerCase() === 'next' ? 1 : -1;

					switch (period.toLowerCase()) {
						case 'year':
							targetTime = targetTime.plus({ years: scale });
							break;
						case 'month':
							targetTime = targetTime.plus({ months: scale });
							break;
						case 'fortnight':
							targetTime = targetTime.plus({ weeks: 2 * scale });
							break;
						case 'week':
							targetTime = targetTime.plus({ weeks: scale });
							break;
					}

					targetTime = targetTime.startOf('day');

					dateFound = true;
				},
			},
			{
				regex: /^now/,
				parser: () => {
					timeFound = true;
				},
			},
			{
				regex: /^in(?<offsets>(?: (?:\d+) (?:hour|minute|second)s?(?: (?:and|,))?)+)/,
				parser: ({ offsets }: Record<string | number, string>) => {
					targetTime = targetTime.plus(this.parseHmsText(offsets));

					timeFound = true;
				},
			},
			{
				regex: /^(?<offsets>(?:(?:\d+) (?:hour|minute|second)s?(?: (?:and|,))?)+) ago/,
				parser: ({ offsets }: Record<string | number, string>) => {
					targetTime = targetTime.minus(this.parseHmsText(offsets));

					timeFound = true;
				},
			},
			{
				regex: /^(?:at )?(?<hours>\d+)(?::(?<minutes>\d+)(?::(?<seconds>\d+))?)?(?<amPm>am|pm)?/,
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

		if (dateFound || timeFound)
			return {
				time: targetTime.valueOf(),
				remainingStr: str,
			};
		return {
			time: null,
			remainingStr: str,
		};
	}

	private static parseHmsText(str: string) {
		const regex = /(?<amount>\d+) (?<unit>hour|minute|second)s?(?: (?:and|,))?/g;

		let match = null;
		const totals: DurationObjectUnits = {};
		while ((match = regex.exec(str)) !== null) {
			const { amount, unit } = match.groups!;
			switch (unit) {
				case 'hour':
					totals.hours =
						(totals.hours || 0) + Number.parseInt(amount);
					break;
				case 'minute':
					totals.minutes =
						(totals.minutes || 0) + Number.parseInt(amount);
					break;
				case 'second':
					totals.seconds =
						(totals.seconds || 0) + Number.parseInt(amount);
					break;
			}
		}
		return totals;
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
