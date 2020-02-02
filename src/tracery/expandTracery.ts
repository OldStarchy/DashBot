import { DefaultModifiersEn } from './default/modifiers-en';
import { RawGrammar } from './Grammar';
import { Tracery } from './Tracery';

export function expandTracery<T extends RawGrammar>(
	entry: keyof T,
	rawGrammar: T
): string {
	const tracery = new Tracery();

	const grammar = tracery.createGrammar(rawGrammar);
	grammar.addModifiers(DefaultModifiersEn);

	const result = grammar.flatten(`#${entry}#`);

	return result;
}
