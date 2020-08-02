import { Bot } from 'mineflayer';
import winston from 'winston';
import Message from '../../../ChatServer/Message';
import TextChannel from '../../../ChatServer/TextChannel';
import Command from '../../../Command';
import sleep from '../../../util/sleep';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 10;

export default class FishCommand extends Command {
	readonly name = 'fish';
	readonly description =
		'Bot automatically selects its Fishing Rod from its' +
		" inventory and starts fishing. A subsequent call to 'fish'" +
		' will stop fishing. This will fail if there is no Fishing' +
		" Rod in Bot's inventory.";

	private followLock: BusyLockKey | null = null;
	private bot: Bot;
	private channel: TextChannel | null = null;
	private fishing = false;
	private _lineIsOut = false;

	constructor(private client: MineflayerClient) {
		super();
		this.bot = this.client.getBot()!;
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
		await this.equipFishingRod();

		this.channel!.sendText(`Fishing.`);

		// no await
		this._fish();
	}

	private async _fish() {
		this.fishing = true;
		while (this.fishing) {
			this._lineIsOut = true;
			const err = await new Promise<Error | undefined>(s => {
				this.bot.fish(s);
			});
			this._lineIsOut = false;

			if (err) {
				winston.error(err.message, { error: err });
				this.bot.chat('Failure.');
				this.stopFishing();
				return;
			}

			await sleep(500);

			// const { player, entity } = await new Promise((s, f) => {
			// 	this.bot.once(
			// 		'playerCollect',
			// 		(player: Entity, entity: Entity) => {
			// 			s({ player, entity });
			// 		}
			// 	);
			// });
			// if (entity.kind === 'Drops' && player === this.bot.entity) {
			// }
		}
	}

	stopFishing() {
		this.fishing = false;
		if (this._lineIsOut) this.bot.activateItem();
	}

	async equipFishingRod() {
		const mcData = this.client.getMcData()!;
		const fishingRod = mcData.itemsByName['fishing_rod'].id;
		const err = await new Promise<Error | undefined>(s => {
			(this.bot as any).equip(fishingRod, 'hand', s);
		});

		if (err) {
			winston.error(err.message, { error: err });
			this.bot.chat('Failure.');
			return;
		}
	}
}
