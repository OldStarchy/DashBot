import Message from './ChatServer/Message';

export default abstract class Command {
	abstract readonly name: string;
	readonly alias: string[] | null = null;
	abstract readonly description: string;

	getUsage(): string {
		return `${this.name}${
			this.alias !== null ? ` (${this.alias.join(', ')})` : ``
		}:\n${this.description}`;
	}
	abstract run(message: Message, ...args: string[]): Promise<void>;
}

export class CommandSet {
	readonly commands: Command[] = [];

	add(command: Command) {
		this.commands.push(command);
	}

	async run(message: Message, commandName: string, args: string[]) {
		for (const command of this.commands) {
			if (
				command.name === commandName ||
				command.alias?.includes(commandName)
			) {
				await command.run(message, ...args);
				return;
			}
		}
	}
}
