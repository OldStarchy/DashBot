import Message from '../ChatServer/Message';
import MinecraftServer from '../ChatServer/Minecraft/MinecraftServer';
import Command from '../Command';
import RichText, { RichTextObj } from '../Rcon/RichText';

enum Items {
	FermentedSpiderEye = 'Fermented Spider Eye',
	RedstoneDust = 'Redstone Dust',
	GlowstoneDust = 'Glowstone Dust',
	NetherWart = 'Nether Wart',
	Gunpowder = 'Gunpowder',
	Sugar = 'Sugar',
	RabbitsFoot = 'Rabbits Foot',
	BlazePowder = 'Blaze Powder',
	GlisteringMelon = 'Glistering Melon',
	SpiderEye = 'Spider Eye',
	GhastTear = 'Ghast Tear',
	MagmaCream = 'Magma Cream',
	Pufferfish = 'Pufferfish',
	GoldenCarrot = 'Golden Carrot',
	TurtleShell = 'Turtle Shell',
	PhantomMembrane = 'Phantom Membrane',
	DragonsBreath = 'Dragons Breath',
}

interface Potion {
	name: string;
	items: string[][];
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
		items: (items instanceof Array
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

const potionToExplination = (potion: Potion): RichText => {
	const text: RichTextObj[] = [{ text: potion.name + ':\n' }];

	for (const recipe of potion.items) {
		for (let i = 0; i < recipe.length; i++) {
			const item = recipe[i];
			text.push({
				text: i === 0 ? '  ' : '\n  OR\n  ',
			});

			text.push({
				text: `Potion of ${item}`,
				color: 'dark_green',
			});
		}

		text.push({
			text: '\n',
		});

		if (potion.canExtend)
			text.push({
				text: `Can be extended with ${Items.RedstoneDust}\n`,
			});
		if (potion.canEnhance)
			text.push({
				text: `Can be enhanced with ${Items.GlowstoneDust}\n`,
			});
	}

	return text;
};

export default class BrewingCommand implements Command {
	async run(message: Message | null, name: string, ...args: string[]) {
		if (message === null) return;

		const channel = message.channel;
		const server = channel.server;

		if (!(server instanceof MinecraftServer)) {
			return;
		}

		const rcon = server.getRcon();
		if (!rcon) {
			return;
		}

		//TODO: Search / filter potions by given args

		const msg: RichTextObj[] = [];

		for (let i = 0; i < potions.length; i++) {
			const potion = potions[i];
			const potionBtn: RichTextObj = {
				text: `[${potion.name}]`,
				color: 'green',
				clickEvent: {
					action: 'run_command',
					value:
						'/tellraw @p ' +
						JSON.stringify(potionToExplination(potion)),
				},
			};

			if (i > 0)
				msg.push({
					text: ', ',
				});
			msg.push(potionBtn);
		}

		await rcon.tellraw('@a', msg);
	}
}
