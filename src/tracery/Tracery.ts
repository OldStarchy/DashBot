import { Grammar, RawGrammar } from './Grammar';
import { RuleSet } from './RuleSet';
import { TracerySymbol } from './Symbol';
import { TraceryNode } from './TraceryNode';

export type Tag = string;

export class Tracery {
	private rng: () => number;

	static TraceryNode = TraceryNode;
	static Grammar = Grammar;
	static Symbol = TracerySymbol;
	static RuleSet = RuleSet;

	constructor() {
		this.rng = Math.random;
	}

	/**
	 * Sets the internal random number generator
	 */
	setRng(rng: () => number): void {
		this.rng = rng;
	}

	random(): number {
		return this.rng();
	}
	createGrammar(raw: RawGrammar): Grammar {
		return new Grammar(this, raw);
	}
}
