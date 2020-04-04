import Message from './Message';
import ChatServer from './Server';

export default interface TextChannel {
	getId(): string;
	getName(): string;
	getServer(): ChatServer;
	canSend(): boolean;
	canReceive(): boolean;
	getSupportsReactions(): boolean;
	sendText(message: string): Promise<Message | void>;
}
