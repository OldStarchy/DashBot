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
	extra?: RichText;
	/**
	 * Optional. The color to render the content in.
	 */
	color?: Color;
	/**
	 * Optional. The resource location of the [font](https://minecraft.gamepedia.com/Resource_pack#Fonts) for this component in the resource pack within `assets/<namespace>/font`. Defaults to `"minecraft:default"`.
	 */
	font?: string;
	/**
	 * Optional. Whether to render the content in bold.
	 */
	bold?: boolean;
	/**
	 * Optional. Whether to render the content in italics. Note that text which is italicized by default, such as custom item names, can be unitalicized by setting this to false.
	 */
	italic?: boolean;
	/**
	 * Optional. Whether to underline the content.
	 */
	underlined?: boolean;
	/**
	 * Optional. Whether to strikethrough the content.
	 */
	strikethrough?: boolean;
	/**
	 * Optional. Whether to render the content obfuscated.
	 */
	obfuscated?: boolean;
	/**
	 * Optional. When the text is shift-clicked by a player, this string is inserted in their chat input. It does not overwrite any existing text the player was writing. This only works in chat messages.
	 */
	insertion?: string;
	/**
	 * Optional. Allows for events to occur when the player clicks on text. Only work in chat messages and written books, unless specified otherwise.
	 */
	clickEvent?: {
		/**
		 * The action to perform when clicked.
		 */
		action: ClickEventAction;
		/**
		 * The URL, file path, chat, command or book page used by the specified action.
		 */
		value: string;
	};
	/**
	 * Optional. Allows for a tooltip to be displayed when the player hovers their mouse over text.
	 */
	hoverEvent?: {
		/**
		 * The type of tooltip to show.
		 */
		action: HoverEventAction;
		/**
		 * @deprecated use contents instead.
		 */
		value?: never;
		/**
		 * The formatting of this tag varies depending on the action.
		 */
		contents: {
			/**
			 * Another raw JSON text component. Can be any valid text component type: string, array, or object. Note that clickEvent and hoverEvent do not function within the tooltip.
			 */
			show_text: RichText;
			/**
			 * The item that should be displayed.
			 */
			show_item?: {
				/**
				 * The [namespaced item ID](https://minecraft.gamepedia.com/Namespaced_ID). Present `minecraft:air` if invalid.
				 */
				id: string;
				/**
				 * Optional. Size of the item stack.
				 */
				count: number;
				/**
				 * Optional. A string containing the serialized NBT of the additional information about the item, discussed more in the subsections of [the player format page](https://minecraft.gamepedia.com/Player.dat_format#Item_structure).
				 */
				tag: string;
			};
			/**
			 * The entity that should be displayed.
			 */
			show_entity?: {
				/**
				 * Optional. Hidden if not present. A raw JSON text that is displayed as the name of the entity.
				 */
				name: RichText;
				/**
				 * A string containing the type of the entity. Should be a namespaced entity ID. Present `minecraft:pig` if invalid.
				 */
				type: string;
				/**
				 * A string containing the UUID of the entity in the hyphenated hexadecimal format. Should be a valid UUID.
				 */
				id: string;
			};
		};
	};
};

export enum Color {
	Black = 'black',
	DarkBlue = 'dark_blue',
	DarkGreen = 'dark_green',
	DarkAqua = 'dark_aqua',
	DarkRed = 'dark_red',
	DarkPurple = 'dark_purple',
	Gold = 'gold',
	Gray = 'gray',
	DarkGray = 'dark_gray',
	Blue = 'blue',
	Green = 'green',
	Aqua = 'aqua',
	Red = 'red',
	LightPurple = 'light_purple',
	Yellow = 'yellow',
	White = 'white',
	Reset = 'reset',
}

export enum ClickEventAction {
	/**
	 * Opens  value as a URL in the user's default web browser.
	 */
	OpenUrl = 'open_url',
	/**
	 * Opens the file at  value on the user's computer. This is used in messages automatically generated by the game (e.g., on taking a screenshot) and cannot be used by players for security reasons.
	 */
	OpenFile = 'open_file',
	/**
	 * Works in signs, but only on the root text component, not on any children. Activated by using the sign. In chat and written books, this has  value entered in chat as though the player typed it themselves and pressed enter. This can be used to run commands, provided the player has the required permissions. Since they are being run from chat, commands must be prefixed with the usual "/" slash. In signs, the command is run by the server at the sign's location, with the player who used the sign as @s. Since they are run by the server, sign commands have the same permission level as a command block instead of using the player's permission level, are not restricted by chat length limits, and do not need to be prefixed with a "/" slash.
	 */
	RunCommand = 'run_command',
	/**
	 * Opens chat and fills in  value. If a chat message was already being composed, it is overwritten.
	 */
	SuggestCommand = 'suggest_command',
	/**
	 * Can only be used in written books. Changes to page  value if that page exists.
	 */
	ChangePage = 'change_page',
	/**
	 * Copies  value to the clipboard.
	 */
	CopyToClipboard = 'copy_to_clipboard',
}

export enum HoverEventAction {
	/**
	 * Shows a raw JSON text component.
	 */
	ShowText = 'show_text',
	/**
	 * Shows the tooltip of an item as if it was being hovering over it in an inventory.
	 */
	ShowItem = 'show_item',
	/**
	 * Shows an entity's name, type, and UUID. Used by  selector.
	 */
	ShowEntity = 'show_entity',
}

type RichText = string | RichTextObj | Array<string | RichTextObj>;
export type RichTextArray = Array<string | RichTextObj>;
export default RichText;
