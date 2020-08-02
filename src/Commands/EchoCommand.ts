import Message from '../ChatServer/Message';
import Command from '../Command';
import Permissions from '../Permissions';

export default class EchoCommand extends Command {
	readonly name = 'echo';
	readonly description = 'Says what you say';

	constructor(private readonly permissions: Permissions) {
		super();
	}
	async run(message: Message) {
		if (message === null) {
			return;
		}

		if (
			!this.permissions.has(
				await message.author.getPerson(),
				'commands.echo'
			)
		) {
			return;
		}

		const content = message.textContent.substr('!echo'.length).trimLeft();

		await message.channel.sendText(content);
	}
}
