import Message from '../ChatServer/Message';
import Command from '../Command';
import getVersion from '../getVersion';

export default class VersionCommand implements Command {
	async run(message: Message | null) {
		if (message === null) return;

		message.channel.sendText(getVersion());
	}
}
