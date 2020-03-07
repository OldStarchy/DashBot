import { throws } from 'assert';
import { expect } from 'chai';
import 'mocha';
import parseArguments from '../../src/util/parseArguments';

describe('parseArguments', () => {
	it('should parse multiple arguments', () => {
		const result = parseArguments('this is a test');

		expect(result).to.eql(['this', 'is', 'a', 'test']);
	});

	it('should ignore multiple spaces', () => {
		const result = parseArguments('this is     a test');

		expect(result).to.eql(['this', 'is', 'a', 'test']);
	});

	it('should treat newlines as space', () => {
		const result = parseArguments(`this is
a test`);

		expect(result).to.eql(['this', 'is', 'a', 'test']);
	});

	it('should handle double quoted strings', () => {
		const result = parseArguments('this is "a test"');

		expect(result).to.eql(['this', 'is', 'a test']);
	});

	it('should handle escaped quotes in strings', () => {
		const result = parseArguments('this "is \\"a\\" test"');

		expect(result).to.eql(['this', 'is "a" test']);
	});

	it("should throw when strings aren't closed properly", () => {
		throws(() => parseArguments('this is "a test'));
	});
});
