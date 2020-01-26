export default function selectRandom<T extends any[]>(array: T): T[number] {
	return array[Math.floor(Math.random() * array.length)];
}
