import Message from '../../../ChatServer/Message';
import Command from '../../../Command';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 10;

export default class AttackCommand extends Command {
	readonly name = 'attack';
	readonly description =
		'Bot will follow the the target Player and attack them with' +
		' its currently selected item whenever it is in range.' +
		' This will fail if the target is not provided as an argument.' +
		' Bot will attack forever.' +
		" You must call 'stop' to end this command.";
	private followLock: BusyLockKey | null = null;

	constructor(private client: MineflayerClient) {
		super();
	}

	async run(message: Message, ...args: string[]): Promise<void> {
		const { channel } = message;
		const bot = this.client.getBot!();
		const follow = this.client.behaviours.follow!;

		if (this.client.isBusy(priority)) {
			channel.sendText("I'm too busy");
			return;
		}

		if (args.length === 0) {
			channel.sendText("Couldn't find target");
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
				targetPlayer.uuid
			);

			channel.sendText(`Attacking ${targetIdentity?.tag ?? target}.`);
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
	}
}
