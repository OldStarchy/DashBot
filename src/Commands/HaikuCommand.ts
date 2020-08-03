import { random as getHaiku } from 'haiku-random';
import Message from '../ChatServer/Message';
import Command from '../Command';

export default class HaikuCommand extends Command {
	readonly name = 'haiku';
	readonly description = 'Gets you a random haiku';

	async run(message: Message) {
		const haiku = getHaiku('shell');

		await message.channel.sendText(haiku);
	}
}
