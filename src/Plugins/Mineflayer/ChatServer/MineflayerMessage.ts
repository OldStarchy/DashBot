import Message from '../../../ChatServer/Message';
import NotSupportedException from '../../../NotSupportedException';
import MinecraftIdentity from '../../Minecraft/ChatServer/MinecraftIdentity';
import MineflayerTextChannel from './MineflayerTextChannel';

export default class MineflayerMessage implements Message {
	constructor(
		private _channel: MineflayerTextChannel,
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

	get rawContent() {
		return this._content;
	}

	async react() {
		throw new NotSupportedException();
	}
}
