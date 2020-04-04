import { expect } from 'chai';
import 'mocha';
import formatTime from '../../src/util/formatTime';

describe('formatTime', () => {
	it('Should format the time nicely', () => {
		const result = formatTime(new Date(2020, 3, 23, 22, 20, 9));

		expect(result).to.equal('2020-03-23 22:20:09');
	});
});
