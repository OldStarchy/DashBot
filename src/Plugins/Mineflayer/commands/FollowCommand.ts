import Message from '../../../ChatServer/Message';
import { Event } from '../../../Events';
import parseArguments from '../../../util/parseArguments';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { BusyLockKey } from '../util/BusyLock';

const priority = 10;

export default class FollowCommand {
	private followLock: BusyLockKey | null = null;

	constructor(private client: MineflayerClient) {
		client.on('message', this.onMessage.bind(this));
	}

	onMessage(event: Event<Message>) {
		const bot = this.client.getBot!();
		const follow = this.client.behaviours.follow!;

		const {
			textContent: message,
			author: { username, tag },
			channel,
		} = event.data;

		const args = parseArguments(message);

		const command = args.shift();

		switch (command) {
			case 'follow':
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
					follow.setTarget(target);

					this.followLock = newLock;
					this.followLock.on('cancelled', () => {
						follow.setTarget(null);
						this.followLock = null;
					});
				} else {
					channel.sendText("I'm too busy");
				}
				break;

			case 'stop':
				if (this.client.isBusy()) {
					if (this.client.stop(11)) {
						channel.sendText('OK');
						this.client.getBot()?.clearControlStates();
					} else {
						channel.sendText('No');
					}
				} else {
					channel.sendText('Not doing anything.');
					this.client.getBot()?.clearControlStates();
				}
				break;

			case 'stop!':
				if (this.client.isBusy()) {
					if (this.client.stop(101)) {
						channel.sendText('OK');
						this.client.getBot()?.clearControlStates();
					} else {
						channel.sendText('No');
					}
				} else {
					channel.sendText('Not doing anything.');
					this.client.getBot()?.clearControlStates();
				}
				break;
		}
	}
}
