import { ChatMessage } from './ChatMessage';

export class LogMessage {
	protected static readonly LINE_REGEX = /^\[(?<time>\d\d:\d\d:\d\d)\] \[(?<thread>[^\/]*)\/(?<logLevel>[^\]]*)\]: (?<content>.*)$/;
	protected static readonly CHAT_MESSAGE_REGEX = /^<(?<author>[^>]*)> (?<message>.*)$/;

	public constructor(
		public readonly time: string,
		public readonly thread: string,
		public readonly logLevel: string,
		public readonly content: string
	) {}

	static parse(rawMessage: string): LogMessage | null {
		const match = LogMessage.LINE_REGEX.exec(rawMessage);

		if (match === null) {
			return null;
		}
		const { time, thread, logLevel, content } = match.groups!;

		if (this.CHAT_MESSAGE_REGEX.test(content)) {
			return new ChatMessage(time, thread, logLevel, content);
		}

		return new LogMessage(time, thread, logLevel, content);
	}
}
