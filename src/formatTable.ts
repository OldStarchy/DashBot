export function formatTable(rows: string[][]) {
	const widths: number[] = [];
	rows.forEach(row =>
		row.forEach((col, index) => {
			widths[index] = Math.max(widths[index] || 0, col.length);
		})
	);
	return (
		'```\n' +
		rows
			.map((row, rowIndex) =>
				row
					.map((col, index) => col.padEnd(widths[index] + 1))
					.join('| ')
			)
			.join('\n') +
		'\n```'
	);
}
