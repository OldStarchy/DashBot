import AudioChannel from './AudioChannel';
import Message from './Message';
import { EventListener } from './notebook';
import Person from './Person';
import TextChannel from './TextChannel';

export default interface ChatServer {
	getTextChannels(): Promise<TextChannel[]>;
	getAudioChannels(): Promise<AudioChannel[]>;
	on(event: 'message', listener: EventListener<[Message]>): void;
	on(event: string, listener: EventListener): void;
	getPrivateChatChannel(person: Person): TextChannel | null;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	getName(): string;
}
