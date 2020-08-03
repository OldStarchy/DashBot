import Message from '../ChatServer/Message';
import Command from '../Command';
import getVersion from '../getVersion';

export default class VersionCommand extends Command {
	readonly name = 'version';
	readonly description = 'Shows the current version... duh';

	async run(message: Message) {
		message.channel.sendText(getVersion());
	}
}
