export function formatTime(date: Date): string {
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	return `${hours}:${minutes}:${seconds}`;
}
