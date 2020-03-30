import Identity from '../Identity';
import Message from '../Message';
import NotSupportedException from '../NotSupportedException';
import TextChannel from '../TextChannel';
import MinecraftIdentity from './MinecraftIdentity';
import MinecraftTextChannel from './MinecraftTextChannel';

export default class MinecraftMessage implements Message {
	constructor(
		private channel: MinecraftTextChannel,
		private author: MinecraftIdentity,
		private message: string
	) {}

	getChannel(): TextChannel {
		return this.channel;
	}

	getAuthor(): Identity {
		return this.author;
	}

	getId(): string | undefined {
		return undefined;
	}

	getTextContent() {
		return this.message;
	}

	async react() {
		throw new NotSupportedException();
	}
}
