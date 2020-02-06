import { DefaultModifiersEn } from '../tracery/default/modifiers-en';
import selectRandom from '../util/selectRandom';

export type Modifier = (string: string, ...args: string[]) => string;

export class Tracery<T extends Grammar> {
	private readonly rules: {
		[ruleName: string]: Rule;
	};

	private readonly varStack: {
		[varName: string]: string;
	}[];

	public readonly modifiers: {
		[modifierName: string]: Modifier;
	};

	constructor(grammar: Grammar) {
		this.rules = {};
		this.varStack = [];
		this.modifiers = {};

		for (const ruleName in grammar) {
			if (grammar.hasOwnProperty(ruleName)) {
				this.rules[ruleName] = new Rule(
					this,
					ruleName,
					grammar[ruleName]
				);
			}
		}
	}

	static generate<T extends Grammar>(
		grammar: T,
		entry: keyof T & string
	): string {
		const tracery = new Tracery<T>(grammar);

		tracery.addModifiers(DefaultModifiersEn);
		return tracery.generate(entry);
	}

	generate(entry: keyof T & string): string {
		return this.evaluate(`#${entry}#`);
	}

	evaluate(expression: string): string {
		return new Rule(this, null, expression).evaluate([]);
	}

	addModifiers(modifiers: { [name: string]: (str: string) => string }): void {
		for (const name in modifiers) {
			if (modifiers.hasOwnProperty(name)) {
				const modifier = modifiers[name];
				this.modifiers[name] = modifier;
			}
		}
	}

	getModifier(name: string): Modifier {
		return this.modifiers[name];
	}

	setVar(name: string, val: string): void {
		this.varStack[0][name] = val;
	}
	getVar(name: string): string | null {
		for (const vars of this.varStack) {
			if (typeof vars[name] === 'string') {
				return vars[name];
			}
		}
		return null;
	}

	pushVars(): void {
		this.varStack.unshift({});
	}
	popVars(): void {
		this.varStack.shift();
	}

	getRule(name: string): Rule {
		return this.rules[name] || null;
	}

	modify(string: string, modifiers: string[]): string {
		return modifiers.reduce(
			(string: string, modifier: string) =>
				this.getModifier(modifier)(string),
			string
		);
	}
}

export type StringKeyedObject = { [prop: string]: unknown };

export class Rule {
	private readonly type: 'string' | 'object';
	private readonly definitions: RuleDefinitionArray;

	private parts: (() => string)[][] = [];

	public constructor(
		private readonly tracery: Tracery<Grammar>,
		public readonly name: string | null,
		definition: RuleDefinition
	) {
		const proto =
			definition instanceof Array
				? definition.length > 0
					? definition[0]
					: ''
				: definition;

		this.type = typeof proto as 'string' | 'object';
		this.definitions =
			definition instanceof Array
				? definition
				: ([definition] as RuleDefinitionArray);

		if (this.type === 'string') {
			this.parts = (this.definitions as string[]).map((def: string) => {
				return this.parse(def);
			});
		}
	}

	private parse(string: string): (() => string)[] {
		let head = 0;
		const length = string.length;

		const tokenRegex: {
			tokenName: 'reference' | 'assignment' | 'plainText';
			regexp: RegExp;
		}[] = [
			{
				tokenName: 'reference',
				regexp: /^\#(?<text>.*?)(?<ending>\#(?<!\\)|$)/, // Any text between a # and another unescaped #, or # and end of string
			},
			{
				tokenName: 'assignment',
				regexp: /^\[(?<variable>.*?)(:(?<!\\))(?<expression>.*?)(\](?<!\\)|$)/, // Any text between [ and a :, and between the : and an unescaped ], or between the : and end of string
			},
			{
				tokenName: 'plainText',
				regexp: /^(.*?)((\#|\[)(?<!\\)|$)/, // Any text up to an unescaped # or [
			},
		];

		const getToken = (
			str: string
		):
			| ['reference' | 'assignment' | 'plainText', RegExpMatchArray]
			| null => {
			for (const tokenStuff of tokenRegex) {
				const { tokenName, regexp } = tokenStuff;

				const match = regexp.exec(str);
				if (match !== null) return [tokenName, match];
			}

			return null;
		};

		const parts: (() => string)[] = [];
		while (head < length) {
			const tokenStuff = getToken(string.substring(head));

			if (tokenStuff === null) {
				throw new Error(
					"can't find token in string, this should never happen"
				);
			}

			const [tokenName, match] = tokenStuff;

			switch (tokenName) {
				case 'plainText':
					parts.push(textPart(match[1]));
					head += match[1].length;
					break;
				case 'assignment':
					const { variable, expression } = match.groups as {
						variable: string;
						expression: string;
					};

					if (/\[(?<!\/)/.test(expression)) {
						throw new Error(
							`Don't nest variable assignments "${match[0]}" in "${string}"`
						);
					}

					parts.push(varPart(variable, expression, this.tracery));

					head += match[0].length;

					break;
				case 'reference':
					const { text, ending } = match.groups as {
						text: string;
						ending: string;
					};

					if (ending == '') {
						throw new Error(`Unclosed # in "${string}"`);
					}

					parts.push(referencePart(text, this.tracery));
					head += match[0].length;
					break;
			}
		}
		return parts;
	}

	public evaluate(modifiers: string[]): string {
		const originalModifiers = modifiers.slice(0);
		this.tracery.pushVars();

		let result = '';
		if (this.type === 'string') {
			result = selectRandom(this.parts)
				.map(part => part())
				.join('');
		} else if (this.type === 'object') {
			let item: unknown = selectRandom(this.definitions);

			while (
				item !== null &&
				typeof item !== 'string' &&
				modifiers.length > 0
			) {
				switch (typeof item) {
					case 'object':
						if (item instanceof Array) {
							throw new Error(
								'Arrays are not supported in tracery object reductions'
							);
						}
						if (item instanceof Object) {
							if (item.hasOwnProperty(modifiers[0])) {
								item = (item as StringKeyedObject)[
									modifiers[0]
								];
								modifiers.shift();
							} else {
								throw new Error(
									`Missing property "${modifiers[0]}" on object for reduction in rule "${this.name}"`
								);
							}
							break;
						}

					case 'number':
						item = item!.toString();
						break;
					case 'function':
						item = item();
						break;
					default:
						throw new Error(
							`Unknown type for tracery object reduction "${typeof item}"`
						);
				}
			}

			if (typeof item === 'string') {
				result = item;
			} else {
				throw new Error(
					`Object could not be reduced to string or number with modifiers in "${
						this.name
					}" rule, modifiers: "${originalModifiers.join('.')}`
				);
			}
		}

		this.tracery.popVars();

		return this.tracery.modify(result, modifiers);
	}
}

const textPart = (string: string): (() => string) => (): string => string;
const referencePart = <T extends Grammar>(
	string: string,
	tracery: Tracery<T>
): (() => string) => {
	const parts = string.split('.');
	return (): string => {
		const variable = tracery.getVar(parts[0]);

		if (variable !== null) {
			return tracery.modify(variable, parts.slice(1));
		}

		const rule = tracery.getRule(parts[0]);

		if (rule === null) {
			throw new Error(`Missing rule named "${parts[0]}"`);
		}

		return rule.evaluate(parts.slice(1));
	};
};
const varPart = <T extends Grammar>(
	variable: string,
	expression: string,
	tracery: Tracery<T>
) => {
	return (): string => {
		tracery.setVar(variable, tracery.evaluate(expression));
		return '';
	};
};

export type OneOrList<T> = T | T[];
export type RuleDefinition =
	| string
	| StringKeyedObject
	| string[]
	| StringKeyedObject[];
export type RuleDefinitionArray = string[] | StringKeyedObject[];
export type Grammar = {
	[ruleName: string]: RuleDefinition;
};
