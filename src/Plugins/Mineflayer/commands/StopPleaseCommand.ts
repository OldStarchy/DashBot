import Message from '../../../ChatServer/Message';
import Command from '../../../Command';
import MineflayerClient from '../ChatServer/MineflayerClient';

export default class StopPleaseCommand extends Command {
	readonly name = 'stop!';
	readonly description =
		'Stops the currently executing command even if that command is high priority.';

	constructor(private client: MineflayerClient) {
		super();
	}

	async run(message: Message): Promise<void> {
		const bot = this.client.getBot()!;

		const { channel } = message;

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
