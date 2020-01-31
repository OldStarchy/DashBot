import { Client, Message } from 'discord.js';
import { ActionResult } from './ActionResult';
import DashBot from './DashBot';

export abstract class Action {
	protected readonly client: Client;
	constructor(protected readonly bot: DashBot) {
		this.client = bot.client;
	}
	abstract handle(message: Message): ActionResult;
}
