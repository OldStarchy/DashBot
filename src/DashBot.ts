import { Client, Message } from 'discord.js';
import Rcon from 'modern-rcon';
import { Logger } from 'winston';
import { Action } from './Action';
import { ActionResult } from './ActionResult';
import { MinecraftLogClient } from './MinecraftLogClient/MinecraftLogClient';

export interface DashBotOptions {
	client: Client;
	config: DashBotConfig;
	logger: Logger;
	minecraftClient?: MinecraftLogClient;
	rcon?: Rcon;
}

export default class DashBot {
	public readonly client: Client;
	public readonly config: DashBotConfig;
	public readonly logger: Logger;
	public readonly minecraftClient?: MinecraftLogClient;
	public readonly rcon?: Rcon;

	private _actions: Action[] = [];

	constructor({
		client,
		config,
		logger,
		minecraftClient,
		rcon,
	}: DashBotOptions) {
		this.client = client;
		this.config = config;
		this.logger = logger;
		this.minecraftClient = minecraftClient;
		this.rcon = rcon;

		this.bindEvents();
		this.initActions();
	}

	public async login(): Promise<string> {
		this.minecraftClient?.start();
		await this.rcon?.connect();
		return await this.client.login(this.config.discordBotToken);
	}

	public async destroy(): Promise<void> {
		this.minecraftClient?.stop();
		await this.rcon?.disconnect();
		return await this.client.destroy();
	}

	private bindEvents(): void {
		if (this.config.debug) {
			this.client.on('debug', info => this.logger.debug(info));
		}

		this.client.on('ready', () => {
			this.logger.info(`Logged in as ${this.client.user!.tag}!`);
		});

		this.client.on('message', this.onMessage.bind(this));
	}

	private async onMessage(message: Message): Promise<void> {
		if (message.author.bot) return;

		try {
			for (const action of this._actions) {
				const result = await action.handle(message);

				if (ActionResult.isHandled(result)) return;
			}
		} catch (e) {
			this.logger.error(`Message "${message.content}" caused error`);
			this.logger.error(e);
			await message.reply('Something broke :poop:');
		}
	}

	private initActions(): void {
		this._actions.push(
			new (class extends Action {
				async handle(message: Message) {
					//TODO: Maybe check to see who's triggered a disconnect so not anyone can do it
					if (message.content === '__disconnect') {
						this.bot.destroy();
						return true;
					}
					return false;
				}
			})(this)
		);
	}
}
