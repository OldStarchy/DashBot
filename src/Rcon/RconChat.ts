import Rcon from 'modern-rcon';
import { RichText } from './RichText';

export class RconChat {
	constructor(
		private _client: Rcon,
		private _from: string,
		private _via: string | null = null
	) {}

	async broadcast(message: string) {
		const cmdJson: RichText = [
			{ text: '<' },
			{ text: this._from, color: 'dark_green' },
		];

		if (this._via) {
			cmdJson.push(
				{ text: ' ' },
				{ text: '(' },
				{ text: this._via, color: 'aqua' },
				{ text: ')' }
			);
		}

		cmdJson.push({ text: '>: ' }, { text: message });

		await this._client.send(`tellraw @a ${JSON.stringify(cmdJson)}`);
	}

	async whisper(to: string, message: string) {
		if (to.trim().startsWith('@') || to.trim() === '') {
			throw Error('invalid to');
		}

		const cmdJson: RichText = [
			{
				text: this._from,
				color: 'gray',
			},
			{
				text: ' ',
			},
		];
		if (this._via) {
			cmdJson.push(
				{
					text: '(',
				},
				{
					text: this._via,
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
		const result = await this._client.send(
			`tellraw ${to} ${JSON.stringify(cmdJson)}`
		);

		if (result === 'No player was found') {
			return false;
		}

		return true;
	}
}
