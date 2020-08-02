import Message from '../../../ChatServer/Message';
import Command from '../../../Command';
import MineflayerClient from '../ChatServer/MineflayerClient';

export default class StopCommand extends Command {
	readonly name = 'stop';
	readonly description =
		'Stops the currently executing command if it is not a priority.' +
		" To stop a command that takes priority use the command 'stop!'.";

	constructor(private client: MineflayerClient) {
		super();
	}

	async run(message: Message): Promise<void> {
		const bot = this.client.getBot()!;

		const { channel } = message;

		if (this.client.isBusy()) {
			if (this.client.stop(11)) {
				channel.sendText('OK');
				bot.clearControlStates();
			} else {
				channel.sendText('No');
			}
		} else {
			channel.sendText('Not doing anything.');
			bot.clearControlStates();
		}
	}
}
