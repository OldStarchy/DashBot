import LogMessage from './LogMessage';

export default class LogInOutMessage extends LogMessage {
	public readonly who: string;
	public readonly event: 'joined' | 'left';

	public constructor(
		time: string,
		thread: string,
		logLevel: string,
		content: string
	) {
		super(time, thread, logLevel, content);
		const match = LogMessage.LOG_IN_OUT_REGEX.exec(this.content);
		if (match === null) {
			throw new Error('invalid message format');
		}
		this.who = match.groups!.who;
		if (
			match.groups!.event === 'joined' ||
			match.groups!.event === 'left'
		) {
			this.event = match.groups!.event;
		} else {
			throw new Error('Invalid join event');
		}
	}
}
