import ChatServer from './ChatServer';
import Person from './Person';
import TextChannel from './TextChannel';

export default interface Identity {
	readonly id: string;
	readonly username: string;
	readonly isBot: boolean;
	readonly server: ChatServer;
	readonly tag: string;
	getPrivateTextChannel(): Promise<TextChannel | null>;
	getPerson(): Promise<Person>;
}
