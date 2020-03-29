import AudioChannel from './AudioChannel';
import Identity from './Identity';
import Message from './Message';
import Person from './Person';
import TextChannel from './TextChannel';

export default interface ChatServer {
	getName(): string;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	getAudioChannels(): Promise<AudioChannel[]>;
	getTextChannels(): Promise<TextChannel[]>;
	getPrivateChatChannel(person: Person): TextChannel | null;
	getIdentityById(id: string): Identity | null;
	on(event: 'message', listener: (message: Message) => void): void;
	on(event: string, listener: (...args: any[]) => void): void;
}
