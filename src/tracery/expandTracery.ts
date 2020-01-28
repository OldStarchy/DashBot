import { Tracery } from './Tracery';
import { DefaultModifiersEn } from './default/modifiers-en';
import { RawGrammar } from './Grammar';

export function expandTracery(entry: string, rawGrammar: RawGrammar) {
	const tracery = new Tracery();

	const grammar = tracery.createGrammar(rawGrammar);
	grammar.addModifiers(DefaultModifiersEn);

	const result = grammar.flatten(`#${entry}#`);

	return result;
}
