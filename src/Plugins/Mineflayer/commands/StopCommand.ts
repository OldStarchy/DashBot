import Message from '../../../ChatServer/Message';
import MineflayerClient from '../ChatServer/MineflayerClient';
import { AbstractMineflayerCommand } from './MineflayerCommand';

export default class StopCommand extends AbstractMineflayerCommand {
	name = 'stop';
	alias = null;
	description =
		'Stops the currently executing command if it is not a priority.' +
		" To stop a command that takes priority use the command 'stop!'.";

	constructor(private client: MineflayerClient) {
		super(client);
	}

	async run(message: Message /*, ...args: string[]*/): Promise<void> {
		const bot = this.client.getBot()!;

		const {
			textContent: textContent,
			author: { username, tag },
			channel: channel,
		} = message;

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
