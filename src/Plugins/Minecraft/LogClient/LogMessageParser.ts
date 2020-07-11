import ChatMessage from './ChatMessage';
import LogInOutMessage from './LogInOutMessage';
import LogMessage from './LogMessage';
import DeathMessage from './PlayerDeathMessage';

export default class LogMessageParser {
	static parse(rawMessage: string): LogMessage | null {
		const match = LogMessage.LINE_REGEX.exec(rawMessage);

		if (match === null) {
			return null;
		}
		const { time, thread, logLevel, content } = match.groups!;

		if (LogMessage.CHAT_MESSAGE_REGEX.test(content)) {
			return new ChatMessage(time, thread, logLevel, content);
		}

		if (LogMessage.LOG_IN_OUT_REGEX.test(content)) {
			return new LogInOutMessage(time, thread, logLevel, content);
		}

		try {
			return new DeathMessage(time, thread, logLevel, content);
		} catch {}

		return new LogMessage(time, thread, logLevel, content);
	}
}
