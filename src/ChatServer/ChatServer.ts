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

export default interface ChatServer extends EventEmitter<ChatServerEvents> {
	readonly id: string;
	readonly me: Readonly<Identity>;
	readonly isConnected: boolean;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	getAudioChannels(): Promise<AudioChannel[]>;
	getTextChannels(): Promise<TextChannel[]>;
	getTextChannel(id: string): Promise<TextChannel | null>;
	getPrivateTextChannel(person: Identity): Promise<TextChannel | null>;
	getIdentityById(id: string): Promise<Identity | null>;
	getIdentityService(): IdentityService;
	awaitConnected(): Promise<this>;
}
