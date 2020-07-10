import { expect } from 'chai';
import { DateTime, Settings } from 'luxon';
import 'mocha';
import DateStringParser from '../../src/util/DateStringParser';

const now = DateTime.utc(2020, 10, 23, 16, 56, 23);
const today = now.startOf('day');
const nowMs = now.valueOf();
const todayMs = today.valueOf();
const secondMs = 1000;
const minuteMs = 60 * secondMs;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;
const weekMs = 7 * dayMs;

const oldNow = Settings.now;
before(() => (Settings.now = () => now.valueOf()));
after(() => (Settings.now = oldNow));

describe('DateStringParser', () => {
	it('parse standard iso dates', () => {
		const result = DateStringParser.tryParse('2020-10-23').time;

		expect(result).to.equal(DateTime.utc(2020, 10, 23).valueOf());
	});

	it('parse standard iso times', () => {
		const result = DateStringParser.tryParse('22:20:09').time;

		expect(result).to.equal(
			DateTime.utc(2020, 10, 23, 22, 20, 9).valueOf()
		);
	});

	it('parse standard short iso times', () => {
		const result = DateStringParser.tryParse('22:20').time;

		expect(result).to.equal(
			DateTime.utc(2020, 10, 23, 22, 20, 0).valueOf()
		);
	});

	it('parse standard 12hr time am', () => {
		const result = DateStringParser.tryParse('6:20am').time;

		expect(result).to.equal(DateTime.utc(2020, 10, 24, 6, 20, 0).valueOf());
	});

	it('parse standard 12hr time pm', () => {
		const result = DateStringParser.tryParse('6:20pm').time;

		expect(result).to.equal(
			DateTime.utc(2020, 10, 23, 18, 20, 0).valueOf()
		);
	});

	it('parse standard very short iso times am', () => {
		const result = DateStringParser.tryParse('6am').time;

		expect(result).to.equal(DateTime.utc(2020, 10, 24, 6, 0, 0).valueOf());
	});

	it('parse standard very short iso times pm', () => {
		const result = DateStringParser.tryParse('12pm').time;

		expect(result).to.equal(DateTime.utc(2020, 10, 24, 12, 0, 0).valueOf());
	});

	it('parse standard iso datetime', () => {
		const result = DateStringParser.tryParse('2020-10-23 22:20:09').time;

		expect(result).to.equal(
			DateTime.utc(2020, 10, 23, 22, 20, 9).valueOf()
		);
	});

	it('today', () => {
		expect(DateStringParser.tryParse('today').time).to.equal(todayMs);
	});
	it('tomorrow', () => {
		expect(DateStringParser.tryParse('tomorrow').time).to.equal(
			todayMs + dayMs
		);
	});
	it('yesterday', () => {
		expect(DateStringParser.tryParse('yesterday').time).to.equal(
			todayMs - dayMs
		);
	});
	it('next week', () => {
		expect(DateStringParser.tryParse('next week').time).to.equal(
			todayMs + weekMs
		);
	});
	it('last week', () => {
		expect(DateStringParser.tryParse('last week').time).to.equal(
			todayMs - weekMs
		);
	});
	it('next month', () => {
		expect(DateStringParser.tryParse('next month').time).to.equal(
			now
				.plus({ months: 1 })
				.startOf('day')
				.valueOf()
		);
	});
	it('last month', () => {
		expect(DateStringParser.tryParse('last month').time).to.equal(
			now
				.minus({ months: 1 })
				.startOf('day')
				.valueOf()
		);
	});

	it('now', () => {
		expect(DateStringParser.tryParse('now').time).to.equal(nowMs);
	});

	it('in 10 seconds', () => {
		expect(DateStringParser.tryParse('in 10 seconds').time).to.equal(
			nowMs + 10 * secondMs
		);
	});

	it('in 5 minutes', () => {
		expect(DateStringParser.tryParse('in 5 minutes').time).to.equal(
			nowMs + 5 * minuteMs
		);
	});

	it('in 1 hour', () => {
		expect(DateStringParser.tryParse('in 1 hour').time).to.equal(
			nowMs + 1 * hourMs
		);
	});

	it('in 1 hour and 20 minutes', () => {
		expect(
			DateStringParser.tryParse('in 1 hour and 20 minutes').time
		).to.equal(nowMs + (1 * hourMs + 20 * minuteMs));
	});

	it('5 minutes ago', () => {
		expect(DateStringParser.tryParse('5 minutes ago').time).to.equal(
			nowMs - 5 * minuteMs
		);
	});

	it('24 hours ago', () => {
		expect(DateStringParser.tryParse('24 hours ago').time).to.equal(
			nowMs - 24 * hourMs
		);
	});

	it('tomorrow at 8:00', () => {
		expect(DateStringParser.tryParse('tomorrow at 8:00').time).to.equal(
			now
				.plus({ days: 1 })
				.startOf('day')
				.set({ hour: 8 })
				.valueOf()
		);
	});

	it('offset for timezones', () => {
		const result = DateStringParser.tryParse('today at 10:00').time;

		expect(result).to.equal(
			now
				.startOf('day')
				.set({ hour: 10 })
				.valueOf()
		);
	});
});
