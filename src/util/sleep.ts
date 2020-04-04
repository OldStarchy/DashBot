export default function sleep(timeout: number): Promise<void> {
	return new Promise(s => setTimeout(s, timeout));
}
