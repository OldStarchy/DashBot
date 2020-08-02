/**
 * Eg. `this._options = shallowMerge(defaults, options);`
 */
export default function shallowMerge<A extends {}, B extends {}>(
	a: A,
	b: B
): A & B {
	const r = {};

	for (const key in a) {
		if (Object.prototype.hasOwnProperty.call(a, key)) {
			(r as A)[key] = a[key];
		}
	}

	for (const key in b) {
		if (Object.prototype.hasOwnProperty.call(b, key)) {
			(r as B)[key] = b[key];
		}
	}

	return r as A & B;
}
