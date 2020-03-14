import { LogMessage } from './LogMessage';

export class ChatMessage extends LogMessage {
	public readonly author: string;
	public readonly message: string;

	public constructor(
		time: string,
		thread: string,
		logLevel: string,
		content: string
	) {
		super(time, thread, logLevel, content);

		const match = LogMessage.CHAT_MESSAGE_REGEX.exec(this.content);
		if (match === null) {
			throw new Error('invalid message format');
		}

		this.author = match.groups!.author;
		this.message = match.groups!.message;
	}
}
