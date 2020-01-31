import { Grammar, RawGrammar } from './Grammar';
import { RuleSet } from './RuleSet';
import { Symbol } from './Symbol';
import { TraceryNode } from './TraceryNode';

export type Tag = string;

export class Tracery {
	private rng: () => number;

	static TraceryNode = TraceryNode;
	static Grammar = Grammar;
	static Symbol = Symbol;
	static RuleSet = RuleSet;

	constructor() {
		this.rng = Math.random;
	}

	/**
	 * Sets the internal random number generator
	 */
	setRng(rng: () => number) {
		this.rng = rng;
	}

	random() {
		return this.rng();
	}
	createGrammar(raw: RawGrammar) {
		return new Grammar(this, raw);
	}
}
