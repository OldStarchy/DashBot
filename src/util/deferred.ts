export type Deferred<TValue = undefined> = Promise<TValue> & {
	resolve: (value: TValue) => void;
	reject: (error: any) => void;
};

export default function deferred<TValue = undefined>() {
	let ds: (value: TValue) => void;
	let df: (err: any) => void;

	const p = new Promise((s, f) => {
		ds = s;
		df = f;
	}) as Deferred<TValue>;

	p.resolve = ds!;
	p.reject = df!;

	return p;
}
