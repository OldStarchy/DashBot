import Message from '../ChatServer/Message';
import Command from '../Command';
import Permissions from '../Permissions';

export default class EchoCommand implements Command {
	constructor(private readonly permissions: Permissions) {}
	async run(message: Message | null, command: string) {
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

		const content =
			command === 'echoraw'
				? message.rawContent.substr('!echoraw'.length).trimLeft()
				: message.textContent.substr('!echo'.length).trimLeft();

		await message.channel.sendText(content);
	}
}
