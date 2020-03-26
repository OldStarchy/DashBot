import Discord from 'discord.js';
import { Logger } from 'winston';
import StorageRegister, { PersistentData } from './StorageRegister';

abstract class Message {}
class DiscordMessage extends Message {
	constructor(private message: Discord.Message) {
		super();
	}

	getAuthor() {
		return new DiscordIdentity(this.message.author);
	}
}

abstract class TextChannel {
	abstract canSend(): boolean;
	abstract canReceive(): boolean;
	abstract sendText(message: string): Promise<Message>;
}

class DiscordDmTextChannel extends TextChannel {
	constructor(private readonly channel: Discord.DMChannel) {
		super();
	}
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

class MinecraftIdentityCache implements IdentityProvider<MinecraftIdentity> {
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

class IdentityService {
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

class Person {
	constructor(private readonly identities: Identity[]) {}
}
