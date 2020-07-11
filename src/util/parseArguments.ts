export default function parseArguments(str: string) {
	const words: string[] = [];
	let currentWord: string[] = [];
	let inString = false;
	let head = 0;
	const pushWord = () => {
		if (currentWord.length > 0) {
			words.push(currentWord.join(''));
			currentWord = [];
		}
	};

	while (head < str.length) {
		const chr = str.charAt(head);
		if (inString) {
			switch (chr) {
				case '\\':
					head++;
					currentWord.push(str.charAt(head));
					break;
				case '"':
					inString = false;
					pushWord();
					break;
				default:
					currentWord.push(chr);
			}
		} else {
			if (/\s/.test(chr)) {
				pushWord();
			} else if (chr === '"') {
				inString = true;
			}

			currentWord.push(chr);
		}
		head++;
	}

	if (inString) {
		throw new Error('Unclosed string when parsing arguments');
	}
	pushWord();
	return words;
}
