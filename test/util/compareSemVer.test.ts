import { expect } from 'chai';
import 'mocha';
import compareSemVer from '../../src/util/compareSemVer';

describe('compareSemVer', () => {
	it('should work', () => {
		const result = compareSemVer('1.0.0', '0.1.0');

		expect(result).greaterThan(0);
	});
	it('should work the other way too', () => {
		const result = compareSemVer('1.0.0', '2.0.0');

		expect(result).lessThan(0);
	});
	it('should work this way too', () => {
		const result = compareSemVer('1.0.0', '1.0.0@dev');

		expect(result).lessThan(0);
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
