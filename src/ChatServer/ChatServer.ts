import { EventHandler } from '../Events';
import AudioChannel from './AudioChannel';
import Identity from './Identity';
import IdentityService from './IdentityService';
import Message from './Message';
import TextChannel from './TextChannel';

export interface PresenceUpdateEventData {
	identity: Identity;
	joined: boolean;
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
	on(event: 'message', handler: EventHandler<Message>): void;
	on(
		event: 'presenceUpdate',
		handler: EventHandler<PresenceUpdateEventData>
	): void;
	on(event: string, handler: EventHandler): void;
	getIdentityService(): IdentityService;
	awaitConnected(): Promise<this>;
}
