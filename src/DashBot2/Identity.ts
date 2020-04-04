import Person from './Person';
import ChatServer from './Server';
import TextChannel from './TextChannel';

export default interface Identity {
	readonly id: string | undefined;
	readonly username: string;
	readonly isBot: boolean;
	readonly server: ChatServer;
	getPrivateTextChannel(): Promise<TextChannel | null>;
	getPerson(): Promise<Person>;
}
