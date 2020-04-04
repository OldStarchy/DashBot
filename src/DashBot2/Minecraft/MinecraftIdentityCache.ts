import StorageRegister, { PersistentData } from '../../StorageRegister';
import { Event, EventEmitter, EventHandler } from '../Events';
import MinecraftIdentity from './MinecraftIdentity';
import MinecraftServer from './MinecraftServer';

export default class MinecraftIdentityCache extends EventEmitter {
	private cache: {
		name: string;
		id?: string;
	}[] = [];
	private store: PersistentData<MinecraftIdentityCache['cache']>;
	constructor(private server: MinecraftServer, storage: StorageRegister) {
		super();
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
	private onDataLoaded(
		event: Event<MinecraftIdentityCache['cache'] | undefined>
	) {
		const data = event.data;
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
			if (this.internalGetByName(name) === undefined) {
				this.cache.push({ name, id });
				this.write();
			}
			return;
		}
		const item = this.internalGetById(id);
		if (item) {
			if (item.name !== name) {
				this.emit(
					new Event('identityChanged', {
						id,
						name,
						oldName: item.name,
					})
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
		return new MinecraftIdentity(this.server, item.name, item.id);
	}
	private internalGetByName(name: string) {
		return this.cache.find(item => item.name === name);
	}
	public getByName(name: string) {
		const item = this.internalGetByName(name);
		if (item === undefined) return null;
		return new MinecraftIdentity(this.server, item.name, item.id);
	}

	public on(
		event: 'identityChanged',
		handler: EventHandler<Record<'id' | 'name' | 'string', string>>
	) {
		super.on(event, handler);
	}
}
