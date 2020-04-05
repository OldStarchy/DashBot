import AudioChannel from './AudioChannel';
import Identity from './Identity';
import IdentityService from './IdentityService';
import Message from './Message';
import TextChannel from './TextChannel';

export interface ChatServerEvents {
	message: [Message];
	presenceUpdate: [Identity, boolean];
}
export default interface ChatServer<
	TIdentity extends Identity = Identity,
	TTextChannel extends TextChannel = TextChannel
> {
	readonly id: string;
	readonly me: Readonly<TIdentity>;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	getAudioChannels(): Promise<AudioChannel[]>;
	getTextChannels(): Promise<TTextChannel[]>;
	getTextChannel(id: string): Promise<TTextChannel | null>;
	getPrivateTextChannel(person: TIdentity): Promise<TTextChannel | null>;
	getIdentityById(id: string): Promise<TIdentity | null>;
	on<T extends keyof ChatServerEvents>(
		event: T,
		listener: (...args: ChatServerEvents[T]) => void
	): void;
	getIdentityService(): IdentityService;
	awaitConnected(): Promise<this>;
}
