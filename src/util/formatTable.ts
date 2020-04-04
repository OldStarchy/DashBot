export default function formatTable(rows: (string[] | '-' | '=')[]): string {
	const widths: number[] = [];

	rows.forEach(row =>
		row instanceof Array
			? row.forEach((col, index) => {
					widths[index] = Math.max(widths[index] || 0, col.length);
			  })
			: void 0
	);

	return (
		'```\n' +
		[
			'┌' + widths.map(w => '─'.repeat(w + 2)).join('┬') + '┐',
			...rows.map(row =>
				row instanceof Array
					? '│' +
					  row
							.map(
								(col, index) =>
									' ' + col.padEnd(widths[index]) + ' '
							)
							.join('│') +
					  '│'
					: row === '-'
					? '├' + widths.map(w => '─'.repeat(w + 2)).join('┼') + '┤'
					: '╞' + widths.map(w => '═'.repeat(w + 2)).join('╪') + '╡'
			),
			'└' + widths.map(w => '─'.repeat(w + 2)).join('┴') + '┘',
		].join('\n') +
		'\n```'
	);
}
