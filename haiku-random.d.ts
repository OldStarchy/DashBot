declare module 'haiku-random' {
	type Format = 'html' | 'shell';
	export function random(format?: Format): string;
	export function getAll(format?: Format): string[];
	export function specific(index: number, format?: Format): string[];
}
