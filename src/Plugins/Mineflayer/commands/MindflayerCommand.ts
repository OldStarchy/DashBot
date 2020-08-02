import Message from '../../../ChatServer/Message';
import { EventForEmitter } from '../../../Events';
import parseArguments from '../../../util/parseArguments';
import MineflayerClient from '../ChatServer/MineflayerClient';

export default interface MindflayerCommand {
	readonly name: string;
	readonly alias: string[] | null;
	getUsage(): string;
	run(message: Message, ...args: string[]): Promise<void>;
}

export abstract class AbstractMindflayerCommand implements MindflayerCommand {
	abstract readonly name: string;
	abstract readonly alias: string[] | null;
	abstract readonly description: string;

	constructor(client: MineflayerClient) {
		client.on('message', this.onMessage.bind(this));
	}

	getUsage(): string {
		return `${this.name}${
			this.alias !== null ? ` (${this.alias.join(', ')})` : ``
		}:\n${this.description}`;
	}

	onMessage(event: EventForEmitter<MineflayerClient, 'message'>) {
		const args = parseArguments(event.data.textContent);
		const command = args.shift()!.toLowerCase();

		if (command === this.name) {
			this.run(event.data, ...args);
		}
	}

	abstract run(message: Message, ...args: string[]): Promise<void>;
}
