import { Bot } from 'mineflayer';
import Message from '../../../ChatServer/Message';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { AbstractMindflayerCommand } from './MindflayerCommand';

const priority = 10;

export default class DropAllCommand extends AbstractMindflayerCommand {
	name = 'dropall';
	alias = null;
	description =
		'Bot drops all the items in their inventory.' +
		' This does not drop equipped gear.';

	private bot: Bot;

	constructor(private client: MineflayerClient) {
		super(client);
		this.bot = this.client.getBot()!;
	}

	async run(message: Message, ...args: string[]): Promise<void> {
		const channel = message.channel;

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
	}
}
