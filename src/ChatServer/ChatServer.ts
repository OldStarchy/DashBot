import { EventEmitter } from '../Events';
import AudioChannel from './AudioChannel';
import Identity from './Identity';
import IdentityService from './IdentityService';
import Message from './Message';
import TextChannel from './TextChannel';

export interface PresenceUpdateEventData {
	identity: Identity;
	joined: boolean;
}

export interface ChatServerEvents {
	message: Message;
	presenceUpdate: PresenceUpdateEventData;
}

export default interface ChatServer<
	TIdentity extends Identity = Identity,
	TTextChannel extends TextChannel = TextChannel
> extends EventEmitter<ChatServerEvents> {
	readonly id: string;
	readonly me: Readonly<TIdentity>;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	getAudioChannels(): Promise<AudioChannel[]>;
	getTextChannels(): Promise<TTextChannel[]>;
	getTextChannel(id: string): Promise<TTextChannel | null>;
	getPrivateTextChannel(person: TIdentity): Promise<TTextChannel | null>;
	getIdentityById(id: string): Promise<TIdentity | null>;
	getIdentityService(): IdentityService;
	awaitConnected(): Promise<this>;
}
