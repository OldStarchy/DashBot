import Rcon from 'modern-rcon';
import { RichText } from './RichText';

export class RconChat {
	constructor(
		private client: Rcon,
		private from: string,
		private via: string | null = null
	) {}

	async broadcast(message: string) {
		const cmdJson: RichText = [
			{ text: '<' },
			{ text: this.from, color: 'dark_green' },
			{ text: ' ' },
		];

		if (this.via) {
			cmdJson.push(
				{ text: '(' },
				{ text: this.via, color: 'aqua' },
				{ text: ')' }
			);
		}

		cmdJson.push({ text: '>: ' }, { text: message });

		await this.client.send(`tellraw @a ${JSON.stringify(cmdJson)}`);
	}

	async whisper(to: string, message: string) {
		if (to.trim().startsWith('@') || to.trim() === '') {
			throw Error('invalid to');
		}

		const cmdJson: RichText = [
			{
				text: this.from,
				color: 'gray',
			},
			{
				text: ' ',
			},
		];
		if (this.via) {
			cmdJson.push(
				{
					text: '(',
				},
				{
					text: this.via,
					color: 'aqua',
				},
				{
					text: ')',
					color: 'gray',
				}
			);
		}
		cmdJson.push(
			{
				text: ' whispers to you: ',
				color: 'gray',
			},
			{
				text: message,
				color: 'gray',
			}
		);
		const result = await this.client.send(
			`tellraw ${to} ${JSON.stringify(cmdJson)}`
		);

		if (result === 'No player was found') {
			return false;
		}

		return true;
	}
}
