export class ActionResult {
	static readonly HANDLED = new ActionResult(true);
	static readonly UNHANDLED = new ActionResult(false);

	constructor(public readonly handled: boolean) {}
}
