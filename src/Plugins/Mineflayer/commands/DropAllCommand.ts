import { Bot } from 'mineflayer';
import winston from 'winston';
import Message from '../../../ChatServer/Message';
import TextChannel from '../../../ChatServer/TextChannel';
import { Event } from '../../../Events';
import parseArguments from '../../../util/parseArguments';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 10;

export default class DropAllCommand {
	private followLock: BusyLockKey | null = null;
	private bot: Bot;
	private channel: TextChannel | null = null;
	private fishing = false;

	constructor(private client: MineflayerClient) {
		this.bot = this.client.getBot()!;
		client.on('message', this.onMessage.bind(this));
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
			const err = await new Promise<Error | undefined>(s => {
				this.bot.fish(s);
			});

			if (err) {
				winston.error(err.message, { error: err });
				this.bot.chat('Failure.');
				this.stopFishing();
				return;
			}

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

	async onMessage(event: Event<Message>) {
		const { textContent: message, channel } = event.data;

		const args = parseArguments(message);

		const command = args.shift();

		switch (command) {
			case 'drop':
				if (this.client.isBusy(priority)) {
					channel.sendText("I'm too busy");
					return;
				}

				const arg = args.shift();

				if (arg !== 'all') {
					channel.sendText('Only "drop all" is supported.');
				}

				const items = this.bot.inventory.items();

				for (const item of items) {
					const err = await new Promise<Error | undefined>(s =>
						this.bot.tossStack(item, s)
					);
					if (err) {
						channel.sendText(err.message);
						return;
					}
				}
				break;
		}
	}
}
