import { fail, throws } from 'assert';
import { expect } from 'chai';
import 'mocha';
import { Tracery } from '../src/tracery/Tracery';

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

	it('Should select things randomly (enough)', () => {
		const tracery = new Tracery({
			origin: [
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

		let last = tracery.generate('origin');
		for (let i = 0; i < 100; i++) {
			const next = tracery.generate('origin');
			if (last !== next) {
				return;
			}
			last = next;
		}

		fail('Generated 100 results exactly the same way');
	});

	it('Should select the same thing given a seeded randomiser', () => {
		const tracery = new Tracery({
			origin: '#number# #number# #number# #number# #number# #number#',
			number: [
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

		const randomiserMaker = (seed: number) => {
			return (): number => {
				seed = Math.pow(seed * Math.PI, 2) % 1;
				return seed;
			};
		};

		const seed = 34;

		tracery.randomiser = randomiserMaker(seed);
		let last = tracery.generate('origin');

		for (let i = 0; i < 100; i++) {
			tracery.randomiser = randomiserMaker(seed);
			const next = tracery.generate('origin');
			if (last !== next) {
				fail('Same seed generation resulted in different results');
			}
			last = next;
		}
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

	it('Should work with nested arrays', () => {
		const result = Tracery.generate(
			{
				origin: [['nested']],
			},
			'origin'
		);

		expect(result).to.equal('nested');
	});

	it('Should reduce objects by following properties and function return values', () => {
		const result = Tracery.generate(
			{
				origin: '#user.get.name#',
				user: [
					{
						get: (): { name: string } => ({
							name: 'teddy',
						}),
					},
				],
			},
			'origin'
		);

		expect(result).to.equal('teddy');
	});

	it('Should do many things at once', () => {
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

	it('Should modify reduced objects', () => {
		const result = Tracery.generate(
			{
				origin: 'This is #user.name#, and this is #user.name.s# cat',
				user: {
					name: 'Ned',
				},
			},
			'origin'
		);

		expect(result).to.equal('This is Ned, and this is Neds cat');
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

	it('Should fail if modifiers attempt to access missing properties on an object', () => {
		throws(
			() => {
				Tracery.generate(
					{
						origin: '#user.name#',
						user: {
							nothing: 'to see here',
						},
					},
					'origin'
				);
			},
			(e: Error) => {
				return /^Missing property "name"/.test(e.message);
			}
		);
	});

	it("Should fail if objects aren't reduced to a string or number", () => {
		throws(
			() => {
				Tracery.generate(
					{
						origin: 'My #object#',
						object: { subProperty: 'things' },
					},
					'origin'
				);
			},
			(e: Error) => {
				return /^Object could not be reduced to string or number/.test(
					e.message
				);
			}
		);
	});

	it('Should handle newlines', () => {
		const result = Tracery.generate(
			{
				origin: 'First line\nSecond line',
			},
			'origin'
		);

		expect(result).to.equal('First line\nSecond line');
	});
});
