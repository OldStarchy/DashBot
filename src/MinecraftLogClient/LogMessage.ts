export class LogMessage {
	public static readonly LINE_REGEX = /^\[(?<time>\d\d:\d\d:\d\d)\] \[(?<thread>[^\/]*)\/(?<logLevel>[^\]]*)\]: (?<content>.*)$/;
	public static readonly CHAT_MESSAGE_REGEX = /^<(?<author>[^>]*)> (?<message>.*)$/;
	public static readonly LOG_IN_OUT_REGEX = /^(?<who>.*?) (?<event>joined|left) the game$/;

	public constructor(
		public readonly time: string,
		public readonly thread: string,
		public readonly logLevel: string,
		public readonly content: string
	) {}
}
