import { Client, Message, TextChannel } from 'discord.js';
import Rcon from 'modern-rcon';
import { Logger } from 'winston';
import { Action } from './Action';
import { ActionResult } from './ActionResult';
import { ChatMessage } from './MinecraftLogClient/ChatMessage';
import { LogInOutMessage } from './MinecraftLogClient/LogInOutMessage';
import { MinecraftLogClient } from './MinecraftLogClient/MinecraftLogClient';
import { RconChat } from './Rcon/RconChat';
import { sleep } from './util/sleep';

export interface DashBotOptions {
	client: Client;
	config: DashBotConfig;
	logger: Logger;
	minecraftClient?: MinecraftLogClient;
	rcon?: Rcon;
}

interface DashBotData {
	minecraftRelayChannelId: null | string;
}

export default class DashBot {
	// public readonly storage: StorageRegister;
	public readonly client: Client;
	public readonly config: DashBotConfig;
	public readonly logger: Logger;
	public readonly minecraftClient?: MinecraftLogClient;
	public readonly rcon?: Rcon;

	private actions: Action[] = [];

	// private readonly store: PersistentData<DashBotData>;

	private _minecraftRelayChannelId: string | null = null;
	private _minecraftRelayChannel: TextChannel | null = null;

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

		// this.store = storage.createStore('DashBot');
		// this.store.on('dataLoaded', this.onReadData.bind(this));

		this.bindEvents();
		this.initActions();
	}

	private async getMinecraftRelayChannel() {
		if (this._minecraftRelayChannel === null) {
			if (this._minecraftRelayChannelId) {
				try {
					this._minecraftRelayChannel = (await this.client.channels.get(
						this._minecraftRelayChannelId
					)) as TextChannel;
				} catch (e) {
					this.logger.error(e);
					this.setMinecraftRelayChannel(null);
				}
			}
		}

		return this._minecraftRelayChannel;
	}

	private setMinecraftRelayChannel(channel: TextChannel | null) {
		this._minecraftRelayChannelId = channel?.id || null;
		this._minecraftRelayChannel = channel;
		// this.store.setData({
		// 	minecraftRelayChannelId: this._minecraftRelayChannelId,
		// });
	}

	// public onReadData(data: DashBotData | undefined) {
	// 	if (data) {
	// 		this._minecraftRelayChannelId = data.minecraftRelayChannelId;
	// 	}
	// }

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
			this.logger.info(`Logged in as ${this.client.user.tag}!`);
		});

		if (this.minecraftClient) {
			this.minecraftClient.on(
				'chatMessage',
				this.onMinecraftMessage.bind(this)
			);
			this.minecraftClient.on(
				'logInOutMessage',
				this.onMinecraftLogInOutMessage.bind(this)
			);
		}
		this.client.on('message', this.onMessage.bind(this));
	}

	private async onMessage(message: Message): Promise<void> {
		if (message.author.bot) return;

		try {
			for (const action of this.actions) {
				const result = await action.handle(message);

				if (ActionResult.isHandled(result)) return;
			}
		} catch (e) {
			this.logger.error(`Message "${message.content}" caused error`);
			this.logger.error(e);
			await message.reply('Something broke :poop:');
		}
	}

	private async onMinecraftMessage(message: ChatMessage) {
		const channel = await this.getMinecraftRelayChannel();
		if (channel) {
			await channel.send(`<${message.author}> ${message.message}`);
		}
	}

	private async onMinecraftLogInOutMessage(message: LogInOutMessage) {
		const channel = await this.getMinecraftRelayChannel();
		if (channel) {
			await channel.send(
				`${message.who} logged ${
					message.event === 'joined' ? 'in' : 'out'
				}.`
			);
		}

		if (this.rcon) {
			if (message.event === 'joined') {
				await sleep(5);

				const chat = new RconChat(this.rcon, 'DashBot');

				await chat.whisper(
					message.who,
					`Welcome to the server ${message.who}`
				);
			}
		}
	}

	private initActions(): void {
		if (this.minecraftClient) {
			this.actions.push(
				new (class extends Action {
					async handle(message: Message) {
						if (message.content == '!minecraft') {
							const relayChannel = await this.bot.getMinecraftRelayChannel();
							if (relayChannel === null) {
								this.bot.setMinecraftRelayChannel(
									message.channel as TextChannel
								);
								message.reply(
									"OK, I'll relay messages from Minecraft to this channel"
								);
							} else {
								if (relayChannel.id === message.channel.id) {
									this.bot.setMinecraftRelayChannel(null);
									message.reply(
										"I'll stop sending messages from Minecraft to this channel"
									);
								} else {
									message.reply(
										`I\'m already sending Minecraft messages to the ${relayChannel.name} channel. Send \`!minecraft\` to that channel again to stop it there first.`
									);
								}
							}
							return true;
						}
						return false;
					}
				})(this)
			);

			if (this.rcon) {
				this.actions.push(
					new (class extends Action {
						async handle(message: Message) {
							const relayChannel = await this.bot.getMinecraftRelayChannel();
							if (message.channel.id === relayChannel?.id) {
								const chat = new RconChat(
									this.bot.rcon!,
									message.author.username.replace(
										/[^a-zA-Z0-9 _-]+/g,
										''
									),
									'discord'
								);

								await chat.broadcast(message.cleanContent);
							}
							return false;
						}
					})(this)
				);
			}
		}

		this.actions.push(
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
