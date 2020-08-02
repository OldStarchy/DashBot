import { DateTime } from 'luxon';
import { Entity } from 'prismarine-entity';
import { Vec3 } from 'vec3';
import { Event, EventEmitter } from '../../../Events';
import { PartialDefaults } from '../../../util/PartialDefaults';
import shallowMerge from '../../../util/shallowMerge';
import MineflayerClient from '../ChatServer/MineflayerClient';
export interface RequiredFollowOptions {
	/**
	 * How close the bot should get before it stops
	 */
	maxDistance: number;
	/**
	 * Currently only supports 'simple' which is walk in a bee-line, jumping if the target is above.
	 */
	pathfindingStrategy: 'simple';
	/**
	 * Target player name
	 */
	target: string | null;

	/**
	 * The pathfinding is recalculated on this interval. eg. every 1000 ms
	 */
	calculationInterval: number;
}

const defaultOptions = {
	maxDistance: 4,
	pathfindingStrategy: 'simple',
	target: null as string | null,
	calculationInterval: 500,
};

export type FollowOptions = PartialDefaults<
	RequiredFollowOptions,
	typeof defaultOptions
>;

interface FollowBehaviourEvents {
	enteredRadius: void;
	exitedRadius: void;
}

interface FollowBehaviourDependencies {
	client: MineflayerClient;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface MineflayerBehaviours {
		follow: FollowBehaviour;
	}
}

export default class FollowBehaviour extends EventEmitter<
	FollowBehaviourEvents
> {
	private _opts: RequiredFollowOptions;

	private tickInterval: NodeJS.Timeout | null = null;
	private _client: MineflayerClient;
	constructor(
		options: FollowOptions,
		{ client }: FollowBehaviourDependencies
	) {
		super();
		this._opts = shallowMerge(defaultOptions, options);
		this._client = client;
		client.setBehaviour('follow', this);
	}

	// set<TOption extends keyof RequiredFollowOptions>(
	// 	option: TOption,
	// 	value: RequiredFollowOptions[TOption]
	// ) {
	// 	this._opts[option] = value;

	// 	if (option === 'calculationInterval') {
	// 		this.restartInterval();
	// 	}
	// }

	setTarget(target: string | null) {
		if (this._opts.target === target) {
			return;
		}

		this._wasClose = null;

		if (target === null) {
			this._opts.target = null;
			this._client.getBot()?.clearControlStates();
			this.stopInterval();
		} else {
			this._opts.target = target;
			this.startInterval();
		}
	}

	stopInterval() {
		if (this.tickInterval !== null) clearInterval(this.tickInterval);

		this.tickInterval = null;
	}

	startInterval() {
		if (this.tickInterval !== null) return;

		this.tickInterval = setInterval(
			this.onTick.bind(this),
			this._opts.calculationInterval
		);
	}

	restartInterval() {
		if (this.tickInterval !== null) clearInterval(this.tickInterval);

		this.tickInterval = setInterval(
			this.onTick.bind(this),
			this._opts.calculationInterval
		);
	}

	private _wasClose: boolean | null = null;
	private onTick() {
		const bot = this._client.getBot();
		if (!bot) return;
		const target = this._opts.target
			? bot.players[this._opts.target]?.entity
			: null;
		if (!target) {
			//TODO: stop following, and somehow release busylock created by caller
			return;
		}

		const pos = target.position;
		const myPos = bot.player.entity.position;

		// this.bot?.chat('I am at ' + myPos.toString());
		// this.bot?.chat('you are at ' + pos.toString());

		if (myPos.xzDistanceTo(pos) < this._opts.maxDistance) {
			if (this._wasClose !== true) {
				bot.clearControlStates();
			}
			this.emit(new Event('enteredRadius', void 0));
			this._wasClose = true;

			// bot.lookAt(new Vec3(pos.x, pos.y + target.height, pos.z));
		} else {
			// if (this._wasClose !== false) {
			// }
			this.emit(new Event('exitedRadius', void 0));

			this._wasClose = false;
			let jump = false;
			if (myPos.y < pos.y) {
				jump = true;
			}

			bot.lookAt(
				new Vec3(pos.x, pos.y + target.height, pos.z),
				false,
				() => {
					bot.setControlState('forward', true);
					if (jump) bot.setControlState('jump', true);
				}
			);
		}
		// 	let blocked = false;
		// 	blockMarch(
		// 		myPos.offset(0, 1.26, 0),
		// 		pos.offset(0, 1.26, 0),
		// 		blockPos => {
		// 			const block = bot.blockAt(blockPos);
		// 			bot.chat(
		// 				`/particle minecraft:composter ${blockPos.x}.5 ${blockPos.y}.5 ${blockPos.z}.5 0 0 0 0 10 force`
		// 			);
		// 			// this.bot?.chat(
		// 			// 	`particle minecraft:composter ${blockPos.x}.5 ${blockPos.y}.5 ${blockPos.z}.5 0 0 0 0 10 force`
		// 			// );
		// 			if (block && block.boundingBox !== 'empty') {
		// 				blocked = true;
		// 				return true;
		// 			}
		// 			return false;
		// 		}
		// 	);

		// 	if (!blocked) {
		// 		// this.bot?.chat('TIME TO DIE');
		// 		bot.lookAt(new Vec3(pos.x, pos.y + 1.25, pos.z), false, () => {
		// 			this.tryAttack(target);
		// 		});
		// 	} //else this.bot?.chat("But I can't see");
		// 	return;
		// } //else this.bot?.chat("i'm on my way");
	}

	private _lastHit = 0;
	private tryAttack(entity: Entity) {
		const bot = this._client.getBot();
		if (!bot) return;

		if (this._lastHit + 500 < DateTime.utc().valueOf()) {
			bot.attack(entity);
			bot.swingArm();
			this._lastHit = DateTime.utc().valueOf();
		}
	}
}
