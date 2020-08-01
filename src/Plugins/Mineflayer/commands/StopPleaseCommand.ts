import Message from '../../../ChatServer/Message';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { AbstractMindflayerCommand } from './MindflayerCommand';

export default class StopPleaseCommand extends AbstractMindflayerCommand {
	name = 'stop!';
	alias = null;
	description =
		'Stops the currently executing command even if that command is high priority.';

	constructor(private client: MineflayerClient) {
		super(client);
	}

	async run(message: Message /*, ...args: string[]*/): Promise<void> {
		const bot = this.client.getBot()!;

		const channel = message.channel;

		if (this.client.isBusy()) {
			if (this.client.stop(999)) {
				channel.sendText('OK!');
				bot.clearControlStates();
			} else {
				channel.sendText("Can't stop; Won't stop!");
			}
		} else {
			channel.sendText('Not doing anything!');
			bot.clearControlStates();
		}
	}
}
