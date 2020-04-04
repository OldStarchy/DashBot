import { RconChat } from '../../Rcon/RconChat';
import StorageRegister, { PersistentData } from '../../StorageRegister';
import { Tracery } from '../../tracery/Tracery';
import selectRandom from '../../util/selectRandom';
import Command from '../Command';
import { DashBot2 } from '../DashBot2';
import { Event } from '../Events';
import IdentityService from '../IdentityService';
import Message from '../Message';
import MinecraftServer from '../Minecraft/MinecraftServer';
import Service from '../Service';
import TextChannel from '../TextChannel';

interface MinecraftRelayServiceState {
	relays: MinecraftRelayData[];
}

interface MinecraftRelayData {
	id: string;
	connectStartTime: number;
	minecraftServerId?: string;
	relayChannelId?: string;
	relayServerId?: string;
}

interface MinecraftRelay {
	id: string;
	connectionExpiryTime: number;
	relayChannel: TextChannel | null;
	minecraftServer: MinecraftServer | null;
}

function randomId() {
	const bits = [];
	const length = 6;
	for (let i = 0; i < length; i++) {
		bits.push(selectRandom([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
	}

	return bits.map(b => b.toString()).join('');
}

const MinecraftRelayServiceGrammar = {
	'already-bound-to-elsewhere': `I\'m sending Minecraft messages to the #relay.relayChannel.name# channel.`,
	'already-bound-to-here': `I\'m sending Minecraft messages to this channel.`,
	'already-bound-from-here':
		'This server chat is connected to #relay.relayChannel.name#',

	'not-bound': 'This channel is not connected to any Minecraft server.',
	'not-bound-here': "This server isn't connected to any channel",

	'connection-started':
		"Type `!minecraft #relay.id#` in the channel you'd like to connect to",
	'connection-cancelled': 'OK, the pending connection has been removed',
	'connection-complete':
		"OK, I'll relay messages from Minecraft to this channel",
	disconnected: "I'll stop relaying messages for this channel",

	'no-matching-id':
		'There are no Minecraft servers waiting to connect with that ID',
	'invalid-target':
		"You can't connect a Minecraft chat to another Minecraft chat. (That would be very confusing for the players)",
	'start-in-minecraft':
		'To create a connection, send `!minecraft start` in the Minecraft server',

	help: [
		'Type `!minecraft` to see if this chat is connected anywhere',
		'Type `!minecraft start` in Minecraft to start a connection',
		'Type `!minecraft stop` to remove a connection',
	].join('\n'),
};

export default class MinecraftRelayService implements Service {
	private static readonly relayConnectExpiryTimeMs = 1000 * 60 * 5;

	private _relays: MinecraftRelay[] = [];
	private _store: PersistentData<MinecraftRelayServiceState>;

	constructor(
		private identityService: IdentityService,
		storage: StorageRegister
	) {
		this._store = storage.createStore('MinecraftRelayService');
		this._store.on('dataLoaded', this.onDataLoaded.bind(this));
	}

	register(bot: DashBot2) {
		bot.on('message', this.onMessage.bind(this));
	}

	private createRelay() {
		let id = randomId();

		while (this.getRelayById(id) !== null) id = randomId();

		const newRelay: MinecraftRelay = {
			id,
			connectionExpiryTime:
				Date.now() + MinecraftRelayService.relayConnectExpiryTimeMs,
			relayChannel: null,
			minecraftServer: null,
		};

		this._relays.push(newRelay);
		return newRelay;
	}

	private getRelayByServer(id: string) {
		return (
			this._relays.find(
				relay =>
					MinecraftRelayService.isRelayValid(relay) &&
					relay.minecraftServer?.id === id
			) || null
		);
	}

	private getRelayByChannel(id: string) {
		return (
			this._relays.find(
				relay =>
					MinecraftRelayService.isRelayValid(relay) &&
					relay.relayChannel?.id === id
			) || null
		);
	}

	private getRelayById(id: string) {
		return (
			this._relays.find(
				relay =>
					MinecraftRelayService.isRelayValid(relay) && relay.id === id
			) || null
		);
	}

	private removeRelay(id: string) {
		const index = this._relays.findIndex(relay => relay.id === id);
		if (index >= 0) {
			this._relays.splice(index, 1);
		}
		this.saveState();
	}

	private static isRelayValid(relay: MinecraftRelay) {
		return (
			(relay.minecraftServer && relay.relayChannel) || // Already connected
			relay.connectionExpiryTime >= Date.now() // or within connection timeout
		);
	}

	private async onDataLoaded(
		event: Event<MinecraftRelayServiceState | undefined>
	) {
		const state = event.data;
		if (state?.relays instanceof Array) {
			for (const relayData of state.relays) {
				if (!(relayData instanceof Object)) {
					continue;
				}

				let relayServer: MinecraftServer | null = null;
				let relayChannel: TextChannel | null = null;

				if (relayData.minecraftServerId) {
					const server = this.identityService.getServer(
						relayData.minecraftServerId
					);
					if (server && server instanceof MinecraftServer) {
						relayServer = server;
					}
				}

				if (relayData.relayChannelId) {
					const serverId = relayData.relayServerId || 'Discord';
					const server = this.identityService.getServer(serverId);
					if (!server) return;
					await server.awaitConnected();
					let channel = await server.getTextChannel(
						relayData.relayChannelId
					);
					if (!channel) {
						//Maybe its a DMChannel
						const identity = (await server.getIdentityById(
							relayData.relayChannelId
						))!;

						channel = await server.getPrivateTextChannel(identity);
					}

					if (channel) {
						relayChannel = channel;
					}
				}

				if (relayServer && relayChannel) {
					this._relays.push({
						id: relayData.id,
						connectionExpiryTime: relayData.connectStartTime,
						minecraftServer: relayServer,
						relayChannel,
					});
				}
			}
		}
	}

	private saveState() {
		this._store.setData({
			relays: this._relays
				.filter(MinecraftRelayService.isRelayValid)
				.map(relay => ({
					id: relay.id,
					connectStartTime: relay.connectionExpiryTime,
					minecraftServerId: relay.minecraftServer?.id,
					relayChannelId: relay.relayChannel?.id,
					relayServerId: relay.relayChannel?.server?.id,
				})),
		});
	}

	private async onMessage(event: Event<Message>) {
		const message = event.data;

		let relay = this.getRelayByServer(message.channel.server.id);
		if (relay) {
			await this.handleMinecraftMessage(message, relay);
			return;
		}

		relay = this.getRelayByChannel(message.channel.id);
		if (relay) {
			await this.handleDiscordMessage(message, relay);
			return;
		}
	}

	private async handleMinecraftMessage(
		message: Message,
		relay: MinecraftRelay
	) {
		if (!relay.relayChannel) {
			// TODO: Log error
			return;
		}

		await relay.relayChannel.sendText(
			`<${message.author.username}> ${message.textContent}`
		);
	}

	private async handleDiscordMessage(
		message: Message,
		relay: MinecraftRelay
	) {
		if (!relay.minecraftServer) {
			// TODO: Log error
			return;
		}

		const rcon = relay.minecraftServer.getRcon();

		if (!rcon) {
			// TODO: log error
			return;
		}

		const chat = new RconChat(
			rcon,
			message.author.username.replace(/[^a-zA-Z0-9 _-]+/g, ''),
			'discord'
		);

		await chat.broadcast(message.textContent);
	}

	public getEnableCommand() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const service = this;

		class ServiceCommand implements Command {
			async run(
				message: Message | null,
				_command: string,
				idOrCommand?: string
			) {
				if (message === null) return;

				const { channel } = message;

				if (idOrCommand && !/^(\d+|start|stop)$/.test(idOrCommand)) {
					await channel.sendText(
						Tracery.generate(MinecraftRelayServiceGrammar, 'help')
					);

					return;
				}
				const { server } = channel;

				if (!(server instanceof MinecraftServer)) {
					const relay = service.getRelayByChannel(channel.id);
					if (relay === null) {
						if (
							idOrCommand === undefined ||
							idOrCommand === 'start'
						) {
							await channel.sendText(
								Tracery.generate(
									MinecraftRelayServiceGrammar,
									'start-in-minecraft'
								)
							);

							return;
						}

						if (idOrCommand === 'stop') {
							await channel.sendText(
								Tracery.generate(
									MinecraftRelayServiceGrammar,
									'not-bound'
								)
							);

							return;
						}

						if (/^\d+$/.test(idOrCommand)) {
							const connectRelay = service.getRelayById(
								idOrCommand
							);

							if (connectRelay) {
								const tracery = new Tracery({
									...MinecraftRelayServiceGrammar,
									relay: connectRelay,
								});

								if (connectRelay.relayChannel) {
									await channel.sendText(
										tracery.generate(
											'already-bound-to-elsewhere'
										)
									);
									return;
								} else {
									connectRelay.relayChannel = channel;
									service.saveState();

									await channel.sendText(
										tracery.generate('connection-complete')
									);
									return;
								}
							}
						}

						await channel.sendText(
							Tracery.generate(
								MinecraftRelayServiceGrammar,
								'no-matching-id'
							)
						);

						return;
					}

					if (idOrCommand === 'stop') {
						service.removeRelay(relay.id);

						await channel.sendText(
							Tracery.generate(
								MinecraftRelayServiceGrammar,
								'disconnected'
							)
						);

						return;
					}

					await channel.sendText(
						Tracery.generate(
							MinecraftRelayServiceGrammar,
							'already-bound-to-here'
						)
					);
					return;
				}

				const relay = service.getRelayByServer(server.id);

				if (relay === null) {
					switch (idOrCommand) {
						case 'start':
							const newRelay = service.createRelay();
							newRelay.minecraftServer = server;
							service.saveState();

							await channel.sendText(
								Tracery.generate(
									{
										...MinecraftRelayServiceGrammar,
										relay: newRelay,
									},
									'connection-started'
								)
							);

							return;

						case undefined:
						case 'stop':
							await channel.sendText(
								Tracery.generate(
									{
										...MinecraftRelayServiceGrammar,
									},
									'not-bound'
								)
							);

							return;

						default:
							await channel.sendText(
								Tracery.generate(
									MinecraftRelayServiceGrammar,
									'invalid-target'
								)
							);

							return;
					}
				}

				if (!relay.relayChannel) {
					if (idOrCommand === 'start') {
						relay.connectionExpiryTime =
							Date.now() +
							MinecraftRelayService.relayConnectExpiryTimeMs;
						service.saveState();

						await channel.sendText(
							Tracery.generate(
								{
									...MinecraftRelayServiceGrammar,
									relay,
								},
								'connection-started'
							)
						);

						return;
					}

					if (idOrCommand === 'stop') {
						service.removeRelay(relay.id);

						await channel.sendText(
							Tracery.generate(
								{
									...MinecraftRelayServiceGrammar,
									relay,
								},
								'connection-cancelled'
							)
						);

						return;
					}
				}

				if (idOrCommand === 'stop') {
					service.removeRelay(relay.id);

					await channel.sendText(
						Tracery.generate(
							MinecraftRelayServiceGrammar,
							'disconnected'
						)
					);

					return;
				}

				await channel.sendText(
					Tracery.generate(
						{
							...MinecraftRelayServiceGrammar,
							relay,
						},
						'already-bound-from-here'
					)
				);
			}
		}

		return new ServiceCommand();
	}
}
