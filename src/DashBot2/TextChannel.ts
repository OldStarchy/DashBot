import Message from './Message';
import ChatServer from './Server';

export default interface TextChannel {
	getName(): string;
	canSend(): boolean;
	canReceive(): boolean;
	sendText(message: string): Promise<Message | void>;
	getServer(): ChatServer;
	getSupportsReactions(): boolean;
}
