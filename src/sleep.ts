export function sleep(timeout: number) {
	return new Promise(s => setTimeout(s, timeout));
}
