import { EventForEmitter } from '../../../Events';
import parseArguments from '../../../util/parseArguments';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 10;

export default class AttackCommand {
	private followLock: BusyLockKey | null = null;

	constructor(private client: MineflayerClient) {
		client.on('message', this.onMessage.bind(this));
	}

	async onMessage(event: EventForEmitter<MineflayerClient, 'message'>) {
		const bot = this.client.getBot!();
		const follow = this.client.behaviours.follow!;

		const { textContent: message, channel } = event.data;

		const args = parseArguments(message);

		const command = args.shift();

		switch (command) {
			case 'attack':
				if (this.client.isBusy(priority)) {
					channel.sendText("I'm too busy");
					return;
				}

				if (args.length === 0) {
					channel.sendText('Attack who?');
					return;
				}
				const target = args[0];

				const targetPlayer = bot?.players[target] ?? null;

				if (!targetPlayer) {
					channel.sendText("Couldn't find target");
					return;
				}

				const newLock = this.client.getBusyLock(priority);

				if (newLock && !newLock.cancelled) {
					const targetIdentity = await channel.server.getIdentityById(
						(targetPlayer as any).uuid
					);

					channel.sendText(
						`Attacking ${targetIdentity?.tag ?? target}.`
					);
					follow.setTarget(target);

					const onEnter = () => {
						if (this.followLock && !this.followLock.cancelled) {
							this.client.attack(targetPlayer.entity);
						}
					};
					follow.on('enteredRadius', onEnter);

					this.followLock = newLock;
					this.followLock.on('cancelled', () => {
						follow.setTarget(null);
						follow.off('enteredRadius', onEnter);
						this.followLock = null;
					});
				} else {
					channel.sendText("I'm too busy");
				}
				break;
		}
	}
}
