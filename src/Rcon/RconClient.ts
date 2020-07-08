import { Logger } from 'winston';
import RconSocket from './RconSocket';
import RichText from './RichText';

export default class RconClient {
	private _disconnectTimeout: NodeJS.Timeout | null = null;
	private _connected = false;

	constructor(private _client: RconSocket, private _logger: Logger) {}

	async connect(disconnectTimeout = 1000 * 10) {
		await this._client.connect();
		this._connected = true;

		if (this._disconnectTimeout !== null) {
			clearTimeout(this._disconnectTimeout);
		}

		this._disconnectTimeout = setTimeout(() => {
			this.disconnect();
			this._disconnectTimeout = null;
		}, disconnectTimeout);
	}

	async disconnect() {
		if (this._disconnectTimeout) {
			clearTimeout(this._disconnectTimeout);
			this._disconnectTimeout = null;
		}

		this._connected = false;
		await this._client.disconnect();
	}

	async broadcast(message: string, from: string, via?: string) {
		const cmdJson: RichText = [
			{ text: '<' },
			{ text: from, color: 'dark_green' },
		];

		if (via) {
			cmdJson.push(
				{ text: ' ' },
				{ text: '(' },
				{ text: via, color: 'aqua' },
				{ text: ')' }
			);
		}

		cmdJson.push({ text: '>: ' }, { text: message });

		await this._send(`tellraw @a ${JSON.stringify(cmdJson)}`);
	}

	async whisper(to: string, message: string, from: string, via?: string) {
		if (to.trim().startsWith('@') || to.trim() === '') {
			throw Error('invalid to');
		}

		const cmdJson: RichText = [
			{
				text: from,
				color: 'gray',
			},
			{
				text: ' ',
			},
		];
		if (via) {
			cmdJson.push(
				{
					text: '(',
				},
				{
					text: via,
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
		const result = await this._send(
			`tellraw ${to} ${JSON.stringify(cmdJson)}`
		);

		if (result === 'No player was found') {
			return false;
		}

		return true;
	}
	async list() {
		const response = await this._send('list');
		const regex = /^There (?:are|is) (?<playerCount>\d+) of a max (?<playerLimit>\d+) players? online:(?<playerList>.*)$/u;
		const match = regex.exec(response);

		if (null !== match) {
			return match.groups!.playerList.split(',').map(name => name.trim());
		}

		return null;
	}

	async kick(name: string, reason?: string) {
		if (!RconClient.validatePlayerName(name)) {
			throw new Error('Invalid name');
		}

		let cmd = `kick ${name}`;
		if (reason) cmd += ` ${reason}`;

		const result = await this._send(cmd);

		const regex = /^Kicked (?<name>[^\s]+): Kicked by an operator$/u;
		const match = regex.exec(result);

		if (null !== match) {
			return true;
		}

		return false;
	}

	async op(name: string) {
		if (!RconClient.validatePlayerName(name)) {
			throw new Error('Invalid name');
		}

		const result = await this._send(`op ${name}`);

		const regex = /^Made (?<name>[^\s]+) a server operator$/u;
		const match = regex.exec(result);

		if (null !== match) {
			return true;
		}

		if (result.startsWith('Nothing changed.')) {
			return true;
		}

		return false;
	}

	async deop(name: string) {
		if (!RconClient.validatePlayerName(name)) {
			throw new Error('Invalid name');
		}

		const result = await this._send(`deop ${name}`);

		const regex = /^Made (?<name>[^\s]+) no longer a server operator$/u;
		const match = regex.exec(result);

		if (null !== match) {
			return true;
		}

		if (result.startsWith('Nothing changed.')) {
			return true;
		}

		return false;
	}

	async announce(title: RichText, subtitle: RichText) {
		await this._send(`title @a subtitle ${JSON.stringify(subtitle)}`);
		await this._send(`title @a title ${JSON.stringify(title)}`);
	}

	async tellraw(target: string, text: RichText) {
		await this._send(`tellraw ${target} ${JSON.stringify(text)}`);
	}

	async give(player: string, item: string, count = 1, data = '') {
		const command = `give ${player} ${item}${data} ${count}`;

		return await this._send(command);
	}
	private async _send(data: string) {
		if (!this._connected) {
			await this.connect();
		}

		this._logger.info(`running rcon """${data}"""`);
		const result = await this._client.send(data);

		return result;
	}

	static validatePlayerName(name: string) {
		name = name.trim();

		if (name === '') return false;

		return /^[\w\d]{3,16}$/u.test(name);
	}
}
