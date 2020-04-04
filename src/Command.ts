import Message from './ChatServer/Message';

export default interface Command {
	run(
		message: Message | null,
		name: string,
		...args: string[]
	): Promise<void>;
}
