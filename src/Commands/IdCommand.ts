import Message from '../ChatServer/Message';
import Command from '../Command';
import Permissions from '../Permissions';
import formatTable from '../util/formatTable';

export default class IdCommand implements Command {
	constructor(private readonly permissions: Permissions) {}
	async run(message: Message | null) {
		if (message === null) {
			return;
		}

		if (
			!this.permissions.has(
				await message.author.getPerson(),
				'commands.id'
			)
		) {
			return;
		}

		const person = await message.author.getPerson();

		const ids = person.getIds();

		await message.channel.sendText(
			formatTable([
				['Server ID', 'User ID', 'Role'],
				'=',
				...Object.keys(ids).map(id => [
					id,
					ids[id],
					this.permissions.isAdmin(person) ? 'Admin' : '',
				]),
			])
		);
	}
}
