import LogMessage from './LogMessage';

const player = '(?<player>[a-zA-Z0-9_]+)';
const enemy = '(?<enemy>[a-zA-Z0-9_ ]+?)';
const weapon = '\\[(?<weapon>[a-zA-Z0-9_ ]+)\\]';

const deathMessages = {
	'death.fell.accident.ladder': player + ' fell off a ladder',
	'death.fell.accident.vines': player + ' fell off some vines',
	'death.fell.accident.water': player + ' fell out of the water',
	'death.fell.accident.generic': player + ' fell from a high place',
	'death.fell.killer': player + ' was doomed to fall',
	'death.fell.assist': player + ' was doomed to fall by ' + enemy,
	'death.fell.assist.item':
		player + ' was doomed to fall by ' + enemy + ' using ' + weapon,
	'death.fell.finish': player + ' fell too far and was finished by ' + enemy,
	'death.fell.finish.item':
		player +
		' fell too far and was finished by ' +
		enemy +
		' using ' +
		weapon,
	'death.attack.lightningBolt': player + ' was struck by lightning',
	'death.attack.lightningBolt.player':
		player + ' was struck by lightning whilst fighting ' + enemy,
	'death.attack.inFire': player + ' went up in flames',
	'death.attack.inFire.player':
		player + ' walked into fire whilst fighting ' + enemy,
	'death.attack.onFire': player + ' burned to death',
	'death.attack.onFire.player':
		player + ' was burnt to a crisp whilst fighting ' + enemy,
	'death.attack.lava': player + ' tried to swim in lava',
	'death.attack.lava.player':
		player + ' tried to swim in lava to escape ' + enemy,
	'death.attack.hotFloor': player + ' discovered the floor was lava',
	'death.attack.hotFloor.player':
		player + ' walked into danger zone due to ' + enemy,
	'death.attack.inWall': player + ' suffocated in a wall',
	'death.attack.inWall.player':
		player + ' suffocated in a wall whilst fighting ' + enemy,
	'death.attack.cramming': player + ' was squished too much',
	'death.attack.cramming.player': player + ' was squashed by ' + enemy,
	'death.attack.drown': player + ' drowned',
	'death.attack.drown.player':
		player + ' drowned whilst trying to escape ' + enemy,
	'death.attack.starve': player + ' starved to death',
	'death.attack.starve.player':
		player + ' starved to death whilst fighting ' + enemy,
	'death.attack.cactus': player + ' was pricked to death',
	'death.attack.cactus.player':
		player + ' walked into a cactus whilst trying to escape ' + enemy,
	'death.attack.generic': player + ' died',
	'death.attack.generic.player': player + ' died because of ' + enemy,
	'death.attack.explosion': player + ' blew up',
	'death.attack.explosion.player': player + ' was blown up by ' + enemy,
	'death.attack.explosion.player.item':
		player + ' was blown up by ' + enemy + ' using ' + weapon,
	'death.attack.magic': player + ' was killed by magic',
	'death.attack.even_more_magic': player + ' was killed by even more magic',
	'death.attack.message_too_long':
		"Actually, message was too long to deliver fully. Sorry! Here's stripped version: %s",
	'death.attack.wither': player + ' withered away',
	'death.attack.wither.player':
		player + ' withered away whilst fighting ' + enemy,
	'death.attack.anvil': player + ' was squashed by a falling anvil',
	'death.attack.anvil.player':
		player + ' was squashed by a falling anvil whilst fighting ' + enemy,
	'death.attack.fallingBlock': player + ' was squashed by a falling block',
	'death.attack.fallingBlock.player':
		player + ' was squashed by a falling block whilst fighting ' + enemy,
	'death.attack.mob': player + ' was slain by ' + enemy,
	'death.attack.mob.item':
		player + ' was slain by ' + enemy + ' using ' + weapon,
	'death.attack.player': player + ' was slain by ' + enemy,
	'death.attack.player.item':
		player + ' was slain by ' + enemy + ' using ' + weapon,
	'death.attack.arrow': player + ' was shot by ' + enemy,
	'death.attack.arrow.item':
		player + ' was shot by ' + enemy + ' using ' + weapon,
	'death.attack.fireball': player + ' was fireballed by ' + enemy,
	'death.attack.fireball.item':
		player + ' was fireballed by ' + enemy + ' using ' + weapon,
	'death.attack.thrown': player + ' was pummeled by ' + enemy,
	'death.attack.thrown.item':
		player + ' was pummeled by ' + enemy + ' using ' + weapon,
	'death.attack.indirectMagic':
		player + ' was killed by ' + enemy + ' using magic',
	'death.attack.indirectMagic.item':
		player + ' was killed by ' + enemy + ' using ' + weapon,
	'death.attack.thorns': player + ' was killed trying to hurt ' + enemy,
	'death.attack.thorns.item':
		player + ' was killed by ' + weapon + ' trying to hurt ' + enemy,
	'death.attack.trident': player + ' was impaled by ' + enemy,
	'death.attack.trident.item':
		player + ' was impaled by ' + enemy + ' with ' + weapon,
	'death.attack.fall': player + ' hit the ground too hard',
	'death.attack.fall.player':
		player + ' hit the ground too hard whilst trying to escape ' + enemy,
	'death.attack.outOfWorld': player + ' fell out of the world',
	'death.attack.outOfWorld.player':
		player + " didn't want to live in the same world as " + enemy,
	'death.attack.dragonBreath': player + ' was roasted in dragon breath',
	'death.attack.dragonBreath.player':
		player + ' was roasted in dragon breath by ' + enemy,
	'death.attack.flyIntoWall': player + ' experienced kinetic energy',
	'death.attack.flyIntoWall.player':
		player + ' experienced kinetic energy whilst trying to escape ' + enemy,
	'death.attack.fireworks': player + ' went off with a bang',
	'death.attack.fireworks.player':
		player + ' went off with a bang whilst fighting ' + enemy,
	'death.attack.netherBed.message': player + ' was killed by ' + enemy,
	'death.attack.netherBed.link': 'Intentional Game Design',
	'death.attack.sweetBerryBush':
		player + ' was poked to death by a sweet berry bush',
	'death.attack.sweetBerryBush.player':
		player +
		' was poked to death by a sweet berry bush whilst trying to escape ' +
		enemy,
	'death.attack.sting': player + ' was stung to death',
	'death.attack.sting.player': player + ' was stung to death by ' + enemy,
};

export const deathMessageRegex = (Object.keys(
	deathMessages
) as (keyof typeof deathMessages)[]).map((id: keyof typeof deathMessages) => ({
	id,
	regex: new RegExp('^' + deathMessages[id] + '$'),
}));

export default class DeathMessage extends LogMessage {
	public readonly messageTypeId: string;
	public readonly player?: string;
	public readonly enemy?: string;
	public readonly weapon?: string;
	constructor(
		time: string,
		thread: string,
		logLevel: string,
		content: string
	) {
		super(time, thread, logLevel, content);

		const type = deathMessageRegex.find(({ regex }) => regex.test(content));

		if (!type) {
			throw new Error('Message is not a death message');
		}

		const match = type.regex.exec(this.content)!;

		this.messageTypeId = type.id;
		this.player = match?.groups!.player;
		this.enemy = match?.groups!.enemy;
		this.weapon = match?.groups!.weapon;
	}
}
