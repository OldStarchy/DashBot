import Person from './Person';
import ChatServer from './Server';
import TextChannel from './TextChannel';

export default interface Identity {
	readonly id: string | undefined;
	readonly username: string;
	getIsBot(): boolean;
	getPrivateTextChannel(): Promise<TextChannel | null>;
	getPerson(): Person;
	getServer(): ChatServer;
}
