import { expect } from 'chai';
import 'mocha';

const func = (): 7 => 7;

describe('first test', () => {
	it('should return 7', () => {
		const result = func();

		expect(result).to.equal(7);
	});
});
