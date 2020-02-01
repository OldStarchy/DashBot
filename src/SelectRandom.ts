export default function selectRandom<T extends unknown[]>(
	array: T,
	limit?: number
): T[number] {
	if (limit === undefined || limit < 1) limit = array.length;

	limit = Math.min(limit, array.length);
	const r = array[Math.floor(Math.random() * limit)];
	return r;
}
