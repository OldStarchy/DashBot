export default class NotSupportedException extends Error {
	constructor(message?: string) {
		super(message);
	}
}
