export function escapeSpecialCharacters(username: string): string {
	const name = username.replace(
		/(\[|\]|\|\{|\}|\\|\.|\*|\+|\/|\$|\^)/g,
		'\\$1'
	);
	return name;
}
