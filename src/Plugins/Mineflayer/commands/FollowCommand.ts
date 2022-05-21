import MineflayerPathfinder from 'mineflayer-pathfinder';
import Message from '../../../ChatServer/Message';
import Command from '../../../Command';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 5;

export default class FollowCommand extends Command {
	readonly name = 'follow';
	readonly description =
		'Bot follows the target Player, standing still whenever in range.' +
		' If target argument is not provided, the target defaults to' +
		" the calling player. You must call 'stop' to end this command.";

	private followLock: BusyLockKey | null = null;

	constructor(private client: MineflayerClient) {
		super();
	}

	async run(message: Message, ...args: string[]): Promise<void> {
		const bot = this.client.getBot!();
		const follow = this.client.behaviours.follow!;

		const {
			author: { username, tag },
			channel: channel,
		} = message;

		if (this.client.isBusy(priority)) {
			channel.sendText("I'm too busy");
			return;
		}

		const target = args.length > 0 ? args[0] : username;

		const targetPlayer = bot?.players[target] ?? null;

		if (!targetPlayer) {
			channel.sendText("Couldn't find target");
			return;
		}

		const newLock = this.client.getBusyLock(priority);

		if (newLock && !newLock.cancelled) {
			channel.sendText(`Following ${tag}.`);
			this.client
				.getBot()!
				.pathfinder.setGoal(
					new MineflayerPathfinder.goals.GoalFollow(
						targetPlayer.entity,
						3
					),
					true
				);
			// follow.setTarget(target);

			this.followLock = newLock;
			this.followLock.on('cancelled', () => {
				this.client.getBot()?.pathfinder.stop();
				// follow.setTarget(null);
				this.followLock = null;
			});
		} else {
			channel.sendText("I'm too busy");
		}
	}
}
