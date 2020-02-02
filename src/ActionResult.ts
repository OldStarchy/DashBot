export class ActionResult {
	static readonly HANDLED = new ActionResult(true);
	static readonly UNHANDLED = new ActionResult(false);

	constructor(public readonly handled: boolean) {}

	static isHandled(result: ActionResult | boolean): boolean {
		if (typeof result == 'boolean') return result;
		return result.handled;
	}
}
