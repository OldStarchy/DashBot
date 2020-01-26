import { Client, Message } from 'discord.js';
import DashBot from './DashBot';
import { ActionResult } from './ActionResult';
export abstract class Action {
	protected readonly client: Client;
	constructor(protected readonly bot: DashBot) {
		this.client = bot.client;
	}
	abstract handle(message: Message): ActionResult;
}
