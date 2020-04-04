import ChatServer from './ChatServer';
import Message from './Message';

export default interface TextChannel {
	readonly id: string;
	readonly name: string;
	readonly canSend: boolean;
	readonly canReceive: boolean;
	readonly supportsReactions: boolean;
	readonly server: ChatServer;
	sendText(message: string): Promise<Message | void>;
}
