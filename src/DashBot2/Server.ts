import { AudioChannel, EventListener, Message, TextChannel } from './Identity';
export default interface Server {
	getTextChannels(): Promise<TextChannel[]>;
	getAudioChannels(): Promise<AudioChannel[]>;
	on(event: 'message', listener: EventListener<[Message]>): void;
	on(event: string, listener: EventListener): void;
}
