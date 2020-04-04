import Message from './Message';
import ChatServer from './Server';

export default interface TextChannel {
	readonly id: string;
	readonly name: string;
	readonly canSend: boolean;
	readonly canReceive: boolean;
	readonly supportsReactions: boolean;
	readonly server: ChatServer;
	sendText(message: string): Promise<Message | void>;
}
