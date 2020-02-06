export default function selectRandom<T extends unknown[]>(
	array: T,
	limit: number | null = null,
	random: () => number = Math.random
): T[number] {
	if (limit === null || limit < 1) limit = array.length;

	limit = Math.min(limit, array.length);
	const r = array[Math.floor(random() * limit)];
	return r;
}
