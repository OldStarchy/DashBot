import { DefaultModifiersEn } from './default/modifiers-en';
import { RawGrammar } from './Grammar';
import { Tracery } from './Tracery';

export function expandTracery(entry: string, rawGrammar: RawGrammar) {
	const tracery = new Tracery();

	const grammar = tracery.createGrammar(rawGrammar);
	grammar.addModifiers(DefaultModifiersEn);

	const result = grammar.flatten(`#${entry}#`);

	return result;
}
