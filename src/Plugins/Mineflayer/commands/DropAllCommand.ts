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

	async run(message: Message): Promise<void> {
		const bot = this.client.getBot()!;
		if (!bot) return;

		const { channel } = message;

		if (this.client.isBusy(priority)) {
			channel.sendText("I'm too busy");
			return;
		}

		const items = bot.inventory.items();

		for (const item of items) {
			try {
				await bot.tossStack(item);
			} catch (err: unknown) {
				if (err instanceof Error) {
					channel.sendText(err.message);
				} else {
					channel.sendText('Something borked tryna toss a stack');
				}
				return;
			}
		}
	}
}
