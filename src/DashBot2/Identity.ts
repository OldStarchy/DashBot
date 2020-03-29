import Discord from 'discord.js';
import { EventEmitter } from 'events';
import Rcon from 'modern-rcon';
import { Logger } from 'winston';
import { MinecraftLogClient } from '../MinecraftLogClient/MinecraftLogClient';
import { RconChat } from '../Rcon/RconChat';
import StorageRegister, { PersistentData } from '../StorageRegister';
import Server from './Server';

export abstract class Message {}
class DiscordMessage extends Message {
	constructor(private message: Discord.Message) {
		super();
	}

	getAuthor() {
		return new DiscordIdentity(this.message.author);
	}
}

export interface TextChannel {
	canSend(): boolean;
	canReceive(): boolean;
	sendText(message: string): Promise<Message | void>;
}

class DiscordDmTextChannel implements TextChannel {
	constructor(private readonly channel: Discord.DMChannel) {}
	canSend() {
		return true;
	}
	canReceive() {
		return true;
	}
	sendText(message: string) {
		return this.channel
			.send(message)
			.then(message => new DiscordMessage(message));
	}
}

abstract class Identity {
	abstract getId(): string | undefined;
	abstract getName(): string;
	abstract getPrivateTextChannel(): TextChannel | null;
}

class DiscordIdentity extends Identity {
	constructor(private readonly person: Discord.User) {
		super();
	}

	getId() {
		return this.person.id;
	}

	getName() {
		return this.person.username;
	}

	getPrivateTextChannel(): TextChannel | null {
		return new DiscordDmTextChannel(this.person.dmChannel);
	}
}

interface IdentityProvider<TIdentity extends Identity> {
	getById(id: string): TIdentity | null;
	getByName(name: string): TIdentity | null;
}

export class MinecraftIdentityCache
	implements IdentityProvider<MinecraftIdentity> {
	private cache: { name: string; id?: string }[] = [];
	private store: PersistentData<MinecraftIdentityCache['cache']>;

	constructor(private logger: Logger, storage: StorageRegister) {
		this.store = storage.createStore('MinecraftIdentityCache');
		this.store.on('dataLoaded', this.onDataLoaded.bind(this));
	}

	private verifyCacheItem(item: MinecraftIdentityCache['cache'][number]) {
		const ton = typeof item.name;
		const toi = typeof item.id;

		return (
			(ton === 'string' && toi === 'string') ||
			(ton === 'string' && toi === 'undefined') ||
			(ton === 'undefined' && toi === 'string')
		);
	}

	private onDataLoaded(data: MinecraftIdentityCache['cache'] | undefined) {
		if (data && typeof data == 'object' && data instanceof Array) {
			for (const item of data) {
				if (this.verifyCacheItem(item)) {
					this.add(item);
				}
			}
		}
	}
	private write() {
		this.store.setData(this.cache);
	}

	public add({ name, id }: { name: string; id?: string }) {
		if (id === undefined) {
			if (this.internalGetByName(name) === null) {
				this.cache.push({ name, id });
				this.write();
			}

			return;
		}

		const item = this.internalGetById(id);

		if (item) {
			if (item.name !== name) {
				this.logger.info(
					`Updated name for Minecraft ID ${id} from ${item.name} to ${name}`
				);
			}
			item.name = name;
			this.write();
			return;
		}

		this.cache.push({ name, id });
		this.write();
		return;
	}

	private internalGetById(id: string) {
		return this.cache.find(item => item.id === id);
	}

	public getById(id: string) {
		const item = this.internalGetById(id);
		if (item === undefined) return null;

		return new MinecraftIdentity(item.name, item.id);
	}

	private internalGetByName(name: string) {
		return this.cache.find(item => item.name === name);
	}

	public getByName(name: string) {
		const item = this.internalGetByName(name);
		if (item === undefined) return null;

		return new MinecraftIdentity(item.name, item.id);
	}
}

export class IdentityService {
	private providers: IdentityProvider<Identity>[] = [];
	constructor(...identityProviders: IdentityProvider<Identity>[]) {
		this.providers = identityProviders;
	}

	getById(id: string) {
		const identities = this.providers
			.map(provider => provider.getById(id))
			.filter(iden => iden !== null) as Identity[];

		return new Person(identities);
	}

	getByName(name: string) {
		const identities = this.providers
			.map(provider => provider.getByName(name))
			.filter(iden => iden !== null) as Identity[];

		return new Person(identities);
	}
}

class MinecraftIdentity extends Identity {
	constructor(
		private readonly username: string,
		private readonly id?: string
	) {
		super();
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.username;
	}

	getPrivateTextChannel() {
		return null;
	}
}

export class Person {
	constructor(private readonly identities: Identity[]) {}
}

export interface TextChatProvider {
	on(event: 'message', listener: (message: Message) => void): this;
	on(event: string, listener: (...args: any[]) => void): this;
}

export class DiscordChatProvider implements TextChatProvider {
	constructor(private discordClient: Discord.Client) {}

	on(event: string, listener: (...args: any[]) => void): this {
		switch (event) {
			case 'message':
				this.discordClient.on(event, message =>
					listener(new DiscordMessage(message))
				);
				break;
			default:
				this.discordClient.on(event, listener);
				break;
		}
		return this;
	}
}

export class TextChatService extends EventEmitter implements TextChatProvider {
	static readonly eventTypes: Readonly<string[]> = ['message'];

	private readonly providers: Readonly<TextChatProvider[]>;

	constructor(...textChatProviders: TextChatProvider[]) {
		super();
		this.providers = textChatProviders;

		for (const provider of this.providers) {
			for (const eventType of TextChatService.eventTypes) {
				provider.on(eventType, this.emit.bind(this, eventType));
			}
		}
	}

	eventNames() {
		return [...TextChatService.eventTypes];
	}
}

export class DashBot2 {
	constructor(
		private identityService: IdentityService,
		private textChatService: TextChatService
	) {
		textChatService.on('message', this.onMessage.bind(this));
	}

	private onMessage(message: Message) {
		return;
	}
}
export interface AudioChannel {
	blah: string;
}
export type EventListener<T extends unknown[] = any[]> = (...args: T) => void;
export class MinecraftTextChannel implements TextChannel {
	constructor(private rcon: Rcon) {}

	canSend() {
		return true;
	}
	canReceive() {
		return true;
	}

	async sendText(message: string) {
		//TODO: "DashBot" magic variable
		const chat = new RconChat(this.rcon, 'DashBot');
		await chat.broadcast(message);
	}
}

export class MinecraftServer implements Server {
	private textChannel: TextChannel;

	constructor(private logReader: MinecraftLogClient, rcon: Rcon) {
		this.textChannel = new MinecraftTextChannel(rcon);
	}

	async getTextChannels() {
		return [this.textChannel];
	}

	async getAudioChannels() {
		return [];
	}

	on(event: string, listener: EventListener) {
		if (event === 'message') {
			this.logReader.on('chatMessage', listener);
		}

		//TODO: other events
	}
}

export class MinecraftServerProvider {
	constructor(private servers: MinecraftServer[]) {}

	getServers() {
		return this.servers;
	}
}
