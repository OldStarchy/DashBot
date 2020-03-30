import Identity from './Identity';
import TextChannel from './TextChannel';

export default interface Message {
	getChannel(): TextChannel;
	getAuthor(): Identity;
	getId(): string | undefined;
	getTextContent(): string;

	react(emoji: string): Promise<void>;
}
