import Person from './Person';
import ChatServer from './Server';
import TextChannel from './TextChannel';

export default abstract class Identity {
	abstract getId(): string | undefined;
	abstract getName(): string;
	abstract getIsBot(): boolean;
	abstract async getPrivateTextChannel(): Promise<TextChannel | null>;
	abstract getPerson(): Person;
	abstract getServer(): ChatServer;
}
