export function lazy<T>(ctor: () => T): () => T {
	let cache: T | null = null;
	return (): T => {
		if (cache === null) cache = ctor();
		return cache;
	};
}
