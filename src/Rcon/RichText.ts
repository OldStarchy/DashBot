export type RichTextObj = {
	/**
	 * A string containing plain text to display directly. Can also be a number or boolean that is displayed directly.
	 */
	text?: string | number | boolean;
	/**
	 * A translation identifier, to be displayed as the corresponding text in the player's selected language. If no corresponding translation can be found, the identifier itself will be used as the translation text. This identifier is the same as the identifiers found in lang files from assets or resource packs.
	 */
	translate?: string;
	/**
	 * Optional. A list of raw JSON text component arguments to be inserted into slots in the translation text. Ignored if  translate is not present.
	 * Translations can contain slots for text that is not known ahead of time, such as player names. These slots are defined in the translation text itself, not in the JSON text component, and generally take the form %s (displays the next argument) or %1$s (displays the first argument; replace 1 with whichever index is desired).[3] If no argument is provided for a slot, the slot will not be displayed.
	 */
	with?: string[];
	/**
	 * Displays a score holder's current score in an objective. Displays nothing if the given score holder or the given objective do not exist, or if the score holder is not tracked in the objective.
	 */
	score?: {
		/**
		 * The name of the score holder whose score should be displayed. This can be a selector like @p or an explicit name. If the text is a selector, the selector must be guaranteed to never select more than one entity, possibly by adding limit=1. If the text is "*", it shows the reader's own score (for example, /tellraw @a {"score":{"name":"*","objective":"obj"}} shows every online player their own score in the "obj" objective).
		 */
		name: string;
		/**
		 * The internal name of the objective to display the player's score in.
		 */
		objective: string;
		/**
		 * Optional. If present, this value is used regardless of what the score would have been.
		 */
		value?: string;
	};
	/**
	 * A string containing a selector. Displayed as the name of the player or entity found by the selector. If more than one player or entity is found by the selector, their names are displayed in either the form "Name1 and Name2" or the form "Name1, Name2, Name3, and Name4". Hovering over a name will show a tooltip with the name, type, and UUID of the target. Clicking a player's name suggests a command to whisper to that player. Shift-clicking a player's name inserts that name into chat. Shift-clicking a non-player entity's name inserts its UUID into chat.
	 */
	selector?: string;
	/**
	 * A keybind identifier, to be displayed as the name of the button that is currently bound to a certain action. For example, {"keybind": "key.inventory"} will display "e" if the player is using the default control scheme
	 */
	keybind?: string;
	/**
	 * The NBT path used for looking up NBT values from an entity, a block entity or an NBT storage. NBT strings display their contents. Other NBT values are displayed as SNBT with no spacing or linebreaks. How values are displayed depends on the value of  interpret. If more than one NBT value is found, either by selecting multiple entities or by using a multi-value path, they are displayed in the form "Value1, Value2, Value3, Value4". Requires one of block, entity, or storage. Having more than one is allowed, but only one will be used.[5]
	 */
	nbt?: string;
	/**
	 * Optional, defaults to false. If true, the game will try to parse the text of each NBT value as a raw JSON text component. This usually only works if the value is an NBT string containing JSON, since JSON and SNBT are not compatible. If parsing fails, displays nothing. Ignored if  nbt is not present.
	 */
	interpret?: boolean;
	/**
	 * A string specifying the coordinates of the block entity from which the NBT value is obtained. The coordinates can be absolute or relative. Ignored if  nbt is not present.
	 */
	block?: string;
	/**
	 * A string specifying the target selector for the entity or entities from which the NBT value is obtained. Ignored if  nbt is not present.
	 */
	entity?: string;
	/**
	 * A string specifying the namespaced ID of the command storage from which the NBT value is obtained. Ignored if  nbt is not present.
	 */
	storage?: string;
	/**
	 * A list of additional raw JSON text components to be displayed after this one.
	 * A child text component. Child text components inherit all formatting and interactivity from the parent component, unless they explicitly override them.
	 */
	extra?: RichTextObj | RichTextObj[];
	/**
	 * Optional. The color to render the content in.
	 */
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
	obfuscated?: boolean;
	strikethrough?: boolean;
	/**
	 * Optional. When the text is shift-clicked by a player, this string is inserted in their chat input. It does not overwrite any existing text the player was writing. This only works in chat messages.
	 */
	insertion?: string;
	clickEvent?: {
		action:
			| `open_url`
			| 'open_file'
			| 'run_command'
			| 'suggest_command'
			| 'change_page'
			| 'copy_to_clipboard';
		value: string;
	};
};

type RichText = string | RichTextObj | Array<string | RichTextObj>;
export default RichText;
