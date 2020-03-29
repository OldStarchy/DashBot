import AudioChannel from './AudioChannel';
import Identity from './Identity';
import Message from './Message';
import { EventListener } from './notebook';
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
	on(event: 'message', listener: EventListener<[Message]>): void;
	on(event: string, listener: EventListener): void;
}
