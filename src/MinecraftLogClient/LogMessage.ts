export default class LogMessage {
	public static readonly LINE_REGEX = /^\[(?<time>\d\d:\d\d:\d\d)\] \[(?<thread>[^\/]*)\/(?<logLevel>[^\]]*)\]: (?<content>.*)$/;

	public static readonly CHAT_MESSAGE_REGEX = /^<(?<author>[a-zA-Z0-9_]*)> (?<message>.*)$/;
	public static readonly LOG_IN_OUT_REGEX = /^(?<who>[a-zA-Z0-9_]*) (?<event>joined|left) the game$/;
	public static readonly PREPARE_LEVEL = /^Preparing level "(?<worldName>.*)"$/;
	public static readonly USER_AUTHENTICATOR = /^UUID of player (?<username>[a-zA-Z0-9_]*) is (?<id>[0-8a-f-]*)$/;

	public constructor(
		public readonly time: string,
		public readonly thread: string,
		public readonly logLevel: string,
		public readonly content: string
	) {}
}
