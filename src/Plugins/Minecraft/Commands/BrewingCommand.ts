import Message from '../../../ChatServer/Message';
import Command from '../../../Command';
import RconClient from '../../../Rcon/RconClient';
import RichText, {
	ClickEventAction,
	Color,
	RichTextArray,
	RichTextObj,
} from '../../../Rcon/RichText';
import MinecraftServer from '../ChatServer/MinecraftServer';

enum Items {
	FermentedSpiderEye = 'Fermented Spider Eye',
	RedstoneDust = 'Redstone Dust',
	GlowstoneDust = 'Glowstone Dust',
	NetherWart = 'Nether Wart',
	Gunpowder = 'Gunpowder',
	Sugar = 'Sugar',
	RabbitsFoot = "Rabbit's Foot",
	BlazePowder = 'Blaze Powder',
	GlisteringMelon = 'Glistering Melon',
	SpiderEye = 'Spider Eye',
	GhastTear = 'Ghast Tear',
	MagmaCream = 'Magma Cream',
	Pufferfish = 'Pufferfish',
	GoldenCarrot = 'Golden Carrot',
	TurtleShell = 'Turtle Shell',
	PhantomMembrane = 'Phantom Membrane',
	DragonsBreath = "Dragon's Breath",
}

interface Potion {
	name: string;
	recipes: string[][];
	canExtend: boolean;
	canEnhance: boolean;
}

const potions: Potion[] = [];

const makePotion = (
	name: string,
	items: Items | Items[] | Items[][],
	canExtend = true,
	canEnhance = true
) => {
	potions.push({
		name,
		recipes: (items instanceof Array
			? items[0] instanceof Array
				? (items as Items[][])
				: [items as Items[]]
			: [[items]]
		).map(recipe => [Items.NetherWart, ...recipe]),
		canExtend,
		canEnhance,
	});
};

makePotion('Healing', Items.GlisteringMelon, false);
makePotion('Fire Resistance', Items.MagmaCream, true, false);
makePotion('Regeneration', Items.GhastTear);
makePotion('Strength', Items.BlazePowder);
makePotion('Swiftness', Items.Sugar);
makePotion('Night Vision', Items.GoldenCarrot, true, false);
makePotion(
	'Invisibility',
	[Items.GoldenCarrot, Items.FermentedSpiderEye],
	true,
	false
);
makePotion('Water Breathing', Items.Pufferfish, true, false);
makePotion('Leaping', Items.RabbitsFoot);
makePotion('Slow Falling', Items.PhantomMembrane, true, false);

makePotion('Poison', Items.SpiderEye);
makePotion('Weakness', Items.FermentedSpiderEye, true, false);
makePotion(
	'Harming',
	[
		[Items.GlisteringMelon, Items.FermentedSpiderEye],
		[Items.SpiderEye, Items.FermentedSpiderEye],
	],
	false
);
makePotion('Slowness', [
	[Items.Sugar, Items.FermentedSpiderEye],
	[Items.RabbitsFoot, Items.FermentedSpiderEye],
]);
makePotion('Turtle Master', Items.TurtleShell);

makePotion('Splash', Items.Gunpowder);
makePotion('Lingering', [Items.Gunpowder, Items.DragonsBreath]);

const potionToExplanation = (potion: Potion): RichText => {
	const textParts: (string | RichTextObj)[] = [
		{
			text: '\nPotion of ',
			color: Color.Reset,
		},
		{
			text: potion.name,
			color: Color.Green,
		},
		{
			text: `:\n`,
			color: Color.Reset,
		},
	];

	for (let j = 0; j < potion.recipes.length; j++) {
		const recipe = potion.recipes[j];

		textParts.push(
			`  ${recipe.join(', ')}\n` +
				`${j < potion.recipes.length - 1 ? '  OR\n' : '\n'}`
		);
	}

	if (potion.canExtend)
		textParts.push(`Can be extended with ${Items.RedstoneDust}\n`);
	if (potion.canEnhance)
		textParts.push(`Can be enhanced with ${Items.GlowstoneDust}\n`);

	return textParts;
};

const stripRichContent = (content: RichText) =>
	(content instanceof Array ? content : [content])
		.map(part => (typeof part === 'string' ? part : part.text))
		.filter(part => part)
		.map(part => part!.toString())
		.join('');

export default class BrewingCommand implements Command {
	async run(message: Message | null, name: string, ...args: string[]) {
		if (message === null) return;

		const channel = message.channel;
		const server = channel.server;

		let rcon: RconClient | null = null;
		if (server instanceof MinecraftServer) {
			rcon = server.getRcon();
		}

		if (args.length > 0) {
			const search = args.join(' ');

			//TODO: Fuzzy text search
			const potion = potions.find(p => p.name === search);

			if (!potion) {
				await channel.sendText(`No potion named \"${search}\".`);
				return;
			} else {
				if (rcon) await rcon.tellraw('@a', potionToExplanation(potion));
				else
					await channel.sendText(
						stripRichContent(potionToExplanation(potion))
					);
				return;
			}
		}

		let msg: RichTextArray = [];

		const itemsPerMessage = 3;
		for (let i = 0; i < potions.length; i++) {
			const potion = potions[i];
			const potionBtn: RichTextObj = {
				text: `[${potion.name}]`,
				color: Color.Green,
				clickEvent: {
					action: ClickEventAction.RunCommand,
					value: `!brewing ${potion.name}`,
				},
			};

			if (i % itemsPerMessage > 0)
				msg.push({
					text: ', ',
					color: Color.Reset,
				});
			msg.push(potionBtn);

			if (i % itemsPerMessage === itemsPerMessage - 1) {
				if (rcon) await rcon.tellraw('@a', msg);
				else await channel.sendText(stripRichContent(msg));
				msg = [];
			}
		}

		if (msg.length > 0) {
			if (rcon) await rcon.tellraw('@a', msg);
			else await channel.sendText(stripRichContent(msg));
		}
	}
}
