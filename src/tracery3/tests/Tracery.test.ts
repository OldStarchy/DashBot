import { throws } from 'assert';
import { expect } from 'chai';
import 'mocha';
import { Tracery } from '../Tracery';

describe('Tracery3', () => {
	it('Should interpolate', () => {
		const result = Tracery.generate(
			{
				origin: 'Test #other#',
				other: 'test',
			},
			'origin'
		);

		expect(result).to.equal('Test test');
	});

	it('Should pluralize', () => {
		const result = Tracery.generate(
			{
				origin: 'Test #other.s#',
				other: 'test',
			},
			'origin'
		);

		expect(result).to.equal('Test tests');
	});

	it('Should remember', () => {
		const result = Tracery.generate(
			{
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
			},
			'origin'
		);

		expect(result).to.match(/^(\d+) \1$/);
	});

	it('Should work with objects', () => {
		const result = Tracery.generate(
			{
				origin: '#user.name#',
				user: {
					name: 'freddy',
				},
			},
			'origin'
		);

		expect(result).to.equal('freddy');
	});

	it('Should do many things', () => {
		const result = Tracery.generate(
			{
				origin:
					'[animal:#animal#][adjective:#adjective#]The #adjective# #animal# is #adjective.a# #animal#',
				animal: ['dog', 'cat'],
				adjective: ['smelly', 'tall', 'aerobic'],
			},
			'origin'
		);

		expect(result).to.match(/^The (\w+) (\w+) is an? \1 \2$/);
	});

	it('Should not work with unclosed #', () => {
		throws(
			() => {
				Tracery.generate({ origin: 'this is #half' }, 'origin');
			},
			(e: Error) => {
				return /^Unclosed # in/.test(e.message);
			}
		);
	});

	it('Should not work with nested assignments', () => {
		throws(
			() => {
				Tracery.generate(
					{
						origin:
							'this is [what:stuff[inside:things] #inside#]half',
						thing: 'abcd',
					},
					'origin'
				);
			},
			(e: Error) => {
				return /^Don't nest variable assignments/.test(e.message);
			}
		);
	});
});
