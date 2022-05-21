import winston from 'winston';
import Message from '../../../ChatServer/Message';
import TextChannel from '../../../ChatServer/TextChannel';
import Command from '../../../Command';
import Tracery, { Grammar } from '../../../tracery/Tracery';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 10;

const grammar = {
	starting: ['Fishing.'],
	'already-started': ['Already fishing.'],
	stopping: ['Stopping.'],
	'stopping-with-reason': ['Stopping because #reason#'],
} as const;

export default class FishCommand extends Command {
	readonly name = 'fish';
	readonly description =
		'Bot automatically selects its Fishing Rod from its' +
		" inventory and starts fishing. A subsequent call to 'fish'" +
		' will stop fishing. This will fail if there is no Fishing' +
		" Rod in Bot's inventory.";

	private followLock: BusyLockKey | null = null;
	private channel: TextChannel | null = null;
	private fishing = false;
	private _lineIsOut = false;

	constructor(private client: MineflayerClient) {
		super();
	}

	async say<TAdditional extends string>(
		key: keyof (typeof grammar | Grammar<TAdditional>),
		additionalGrammar?: Grammar<TAdditional>
	) {
		if (!this.channel) return;

		const newGrammar = {
			...grammar,
			...additionalGrammar,
		} as Record<typeof key, any>;

		await this.channel.sendText(Tracery.generate(newGrammar, key));
	}

	async run(message: Message): Promise<void> {
		const { channel } = message;

		if (this.client.isBusy(priority)) {
			channel.sendText("I'm too busy");
			return;
		}

		const newLock = this.client.getBusyLock(priority);
		if (newLock && !newLock.cancelled) {
			this.channel = channel;
			await this.startFishing();

			this.followLock = newLock;
			this.followLock.on('cancelled', () => {
				this.stopFishing();
				this.followLock = null;
			});
		} else {
			channel.sendText("I'm too busy");
		}
	}

	async startFishing() {
		await this.channel?.sendText(Tracery.generate(grammar, 'starting'));
		// no await
		this._fish();
	}

	private async _fish() {
		const bot = this.client.getBot()!;
		if (!bot) return;

		this.fishing = true;
		while (this.fishing) {
			this._lineIsOut = true;
			try {
				await this.equipFishingRod();
				await bot.fish();
				this._lineIsOut = false;
			} catch (err: unknown) {
				this._lineIsOut = false;

				if (!this.fishing) {
					// stopFishing() was called
					return;
				}

				if (err instanceof Error) {
					winston.error(err.message, { error: err });
					this.channel?.sendText(
						Tracery.generate(
							{
								...grammar,
								reason: err.message,
							},
							'stopping-with-reason'
						)
					);
				}
				this.channel?.sendText(Tracery.generate(grammar, 'stopping'));
				this.stopFishing();
				return;
			}
		}
	}

	stopFishing() {
		this.fishing = false;
		const bot = this.client.getBot()!;
		if (bot && this._lineIsOut) {
			//this causes bot.fish in _fish to throw an error
			bot.fish();
		}
		this._lineIsOut = false;
	}

	async equipFishingRod() {
		const bot = this.client.getBot()!;
		if (!bot) return;

		if (bot.heldItem?.name === 'fishing_rod') return;

		const mcData = this.client.getMcData()!;
		const fishingRod = mcData.itemsByName['fishing_rod'].id;
		try {
			await bot.equip(fishingRod, 'hand');
		} catch (err) {
			if (err instanceof Error) {
				winston.error(err.message, { error: err });
			}
			this.channel?.sendText(Tracery.generate(grammar, 'stopping'));
			return;
		}
	}
}
