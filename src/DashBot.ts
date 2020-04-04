import { Client } from 'discord.js';
import Rcon from 'modern-rcon';
import { Logger } from 'winston';
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
	}
}
