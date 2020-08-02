import Message from '../../../ChatServer/Message';
import Command from '../../../Command';
import MineflayerClient from '../ChatServer/MineflayerClient';

const priority = 10;

export default class DropAllCommand extends Command {
	readonly name = 'dropall';
	readonly description =
		'Bot drops all the items in their inventory.' +
		' This does not drop equipped gear.';

	constructor(private client: MineflayerClient) {
		super();
	}

	async run(message: Message, ...args: string[]): Promise<void> {
		const bot = this.client.getBot()!;
		if (!bot) return;

		const { channel } = message;

		if (this.client.isBusy(priority)) {
			channel.sendText("I'm too busy");
			return;
		}

		const arg = args.shift();

		if (arg !== 'all') {
			channel.sendText('Only "drop all" is supported.');
		}

		const items = bot.inventory.items();

		for (const item of items) {
			const err = await new Promise<Error | undefined>(s =>
				bot.tossStack(item, s)
			);
			if (err) {
				channel.sendText(err.message);
				return;
			}
		}
	}
}
