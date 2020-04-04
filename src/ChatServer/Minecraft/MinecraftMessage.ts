import NotSupportedException from '../../NotSupportedException';
import Message from '../Message';
import MinecraftIdentity from './MinecraftIdentity';
import MinecraftTextChannel from './MinecraftTextChannel';

export default class MinecraftMessage implements Message {
	constructor(
		private _channel: MinecraftTextChannel,
		private _author: MinecraftIdentity,
		private _content: string
	) {}

	get channel() {
		return this._channel;
	}

	get author() {
		return this._author;
	}

	get id(): undefined {
		return undefined;
	}

	get textContent() {
		return this._content;
	}

	async react() {
		throw new NotSupportedException();
	}
}
