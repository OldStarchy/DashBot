export function escapeSpecialCharacters(username: string): string {
	var name = username.replace(/(\[|\]|\|\{|\}|\\|\.|\*|\+|\/|\$|\^)/g, '\\$1');
	return name;
}
