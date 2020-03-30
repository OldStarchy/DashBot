import Message from './Message';

export default interface Command {
	run(
		message: Message | null,
		name: string,
		...args: string[]
	): Promise<void>;
}
