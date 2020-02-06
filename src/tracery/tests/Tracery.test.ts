import { expect } from 'chai';
import 'mocha';
import { expandTracery } from '../expandTracery';

describe('Tracery', () => {
	it('Should interpolate', () => {
		const result = expandTracery('origin', {
			origin: 'Test #other#',
			other: 'test',
		});

		expect(result).to.equal('Test test');
	});

	it('Should pluralize', () => {
		const result = expandTracery('origin', {
			origin: 'Test #other.s#',
			other: 'test',
		});

		expect(result).to.equal('Test tests');
	});

	it('Should remember', () => {
		const result = expandTracery('origin', {
			origin: '[thing:#other#]#test#',
			test: '#thing# #thing#',
			other: [
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'8',
				'9',
				'10',
				'11',
				'12',
				'13',
				'14',
				'15',
				'16',
			],
		});

		expect(result).to.match(/^(\d+) \1$/);
	});
});
