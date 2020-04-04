import getVersion from '../../getVersion';
import Command from '../Command';
import Message from '../Message';

export default class VersionCommand implements Command {
	async run(message: Message | null) {
		if (message === null) return;

		message.channel.sendText(getVersion());
	}
}
