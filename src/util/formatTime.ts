function pad(numb: number, length: number) {
	return numb.toString().padStart(length, '0');
}

export default function formatTime(date: Date): string {
	const year = pad(date.getFullYear(), 4);
	const month = pad(date.getMonth(), 2);
	const day = pad(date.getDate(), 2);
	const hours = pad(date.getHours(), 2);
	const minutes = pad(date.getMinutes(), 2);
	const seconds = pad(date.getSeconds(), 2);

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
