import { random as getHaiku } from 'haiku-random';
import Command from '../Command';
import Message from '../Message';

export default class HaikuCommand implements Command {
	async run(message: Message | null) {
		if (message === null) {
			return;
		}

		const haiku = getHaiku('shell');

		await message.channel.sendText(haiku);
	}
}
