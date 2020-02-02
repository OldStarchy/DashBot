import { Grammar } from './Grammar';
import { RawRule, RawRuleSet, RuleSet } from './RuleSet';
import { Tracery } from './Tracery';
import { TraceryNode } from './TraceryNode';

type SingleOrArray<T> = T | Array<T>;
export type SymbolDefinition = SingleOrArray<string>;

export class TracerySymbol {
	private baseRules: RuleSet;
	private stack: Array<RuleSet> = [];
	public isDynamic = false;

	//TODO: Make better type
	private uses: Array<{ node?: TraceryNode }> = [];
	constructor(
		private tracery: Tracery,
		private grammar: Grammar,
		private key: string,
		private rawRules: RawRuleSet
	) {
		this.baseRules = new RuleSet(tracery, grammar, rawRules);
		this.clearState();
	}

	clearState(): void {
		// Clear the stack and clear all ruleSet usages
		this.stack = [this.baseRules];

		this.uses = [];
		this.baseRules.clearState();
	}

	pushRules(rawRules: RawRuleSet): void {
		const rules = new RuleSet(this.tracery, this.grammar, rawRules);
		this.stack.push(rules);
	}

	popRules(): void {
		this.stack.pop();
	}

	selectRule(node?: TraceryNode, errors: Array<string> = []): RawRule | null {
		this.uses.push({
			node: node,
		});

		if (this.stack.length === 0) {
			errors.push(
				"The rule stack for '" + this.key + "' is empty, too many pops?"
			);
			return '((' + this.key + '))';
		}

		return this.stack[this.stack.length - 1].selectRule();
	}

	getActiveRules(): RawRule | null {
		if (this.stack.length === 0) {
			return null;
		}
		return this.stack[this.stack.length - 1].selectRule();
	}

	rulesToJSON(): string {
		return JSON.stringify(this.rawRules);
	}
}
