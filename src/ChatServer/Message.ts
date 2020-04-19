import Identity from './Identity';
import TextChannel from './TextChannel';

export default interface Message {
	readonly channel: TextChannel;
	readonly author: Identity;
	readonly id: string | undefined;
	readonly textContent: string;
	readonly rawContent: string;

	react(emoji: string): Promise<void>;
}
