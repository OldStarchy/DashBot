import { expect } from 'chai';
import 'mocha';
import compareSemVer from '../../src/util/compareSemVer';

describe('compareSemVer', () => {
	it('should return zero when versions are the same', () => {
		expect(compareSemVer('0.0.0', '0.0.0')).to.eq(0);
		expect(compareSemVer('0.0.5', '0.0.5')).to.eq(0);
		expect(compareSemVer('0.1.0', '0.1.0')).to.eq(0);
		expect(compareSemVer('3.0.0', '3.0.0')).to.eq(0);
		expect(compareSemVer('1.4.0', '1.4.0')).to.eq(0);
		expect(compareSemVer('15.5.3', '15.5.3')).to.eq(0);
		expect(compareSemVer('5.1.3@dev', '5.1.3@dev')).to.eq(0);
	});
	it('should return > 0 when the first arg is higher', () => {
		expect(compareSemVer('0.0.2', '0.0.1')).greaterThan(0);
		expect(compareSemVer('0.2.0', '0.1.0')).greaterThan(0);
		expect(compareSemVer('2.0.0', '1.0.0')).greaterThan(0);
		expect(compareSemVer('0.1.0', '0.0.2')).greaterThan(0);
		expect(compareSemVer('1.0.0', '0.2.0')).greaterThan(0);
		expect(compareSemVer('0.0.0@dev', '0.0.0')).greaterThan(0);
	});
	it('should return < 0 when the first arg is lower', () => {
		expect(compareSemVer('0.0.1', '0.0.2')).lessThan(0);
		expect(compareSemVer('0.1.0', '0.2.0')).lessThan(0);
		expect(compareSemVer('1.0.0', '2.0.0')).lessThan(0);
		expect(compareSemVer('0.0.2', '0.1.0')).lessThan(0);
		expect(compareSemVer('0.2.0', '1.0.0')).lessThan(0);
		expect(compareSemVer('0.0.0', '0.0.0@dev')).lessThan(0);
	});
	it('should work with sorting', () => {
		const versions = [
			'1.0.1',
			'0.9.8',
			'0.9.7',
			'1.1.1',
			'1.1.0',
			'1.1.0@dev',
		];
		versions.sort(compareSemVer);

		expect(versions).to.deep.equal([
			'0.9.7',
			'0.9.8',
			'1.0.1',
			'1.1.0',
			'1.1.0@dev',
			'1.1.1',
		]);
	});
});
