export type RichTextObj = {
	text: string;
	color?:
		| 'black'
		| 'dark_blue'
		| 'dark_green'
		| 'dark_aqua'
		| 'dark_red'
		| 'dark_purple'
		| 'gold'
		| 'gray'
		| 'dark_gray'
		| 'blue'
		| 'green'
		| 'aqua'
		| 'red'
		| 'light_purple'
		| 'yellow'
		| 'white'
		| 'reset';
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	obvuscated?: boolean;
	strikethrough?: boolean;
};

export type RichText = string | RichTextObj | Array<string | RichTextObj>;
