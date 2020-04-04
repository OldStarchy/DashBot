import { Event, EventEmitter, EventHandler } from '../../Events';
import StorageRegister, { PersistentData } from '../../StorageRegister';
import MinecraftIdentity from './MinecraftIdentity';
import MinecraftServer from './MinecraftServer';

export default class MinecraftIdentityCache extends EventEmitter {
	private _cache: {
		name: string;
		id?: string;
	}[] = [];
	private _store: PersistentData<MinecraftIdentityCache['_cache']>;
	constructor(private server: MinecraftServer, storage: StorageRegister) {
		super();
		this._store = storage.createStore('MinecraftIdentityCache');
		this._store.on('dataLoaded', this.onDataLoaded.bind(this));
	}
	private verifyCacheItem(item: MinecraftIdentityCache['_cache'][number]) {
		const ton = typeof item.name;
		const toi = typeof item.id;
		return (
			(ton === 'string' && toi === 'string') ||
			(ton === 'string' && toi === 'undefined') ||
			(ton === 'undefined' && toi === 'string')
		);
	}
	private onDataLoaded(
		event: Event<MinecraftIdentityCache['_cache'] | undefined>
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
		this._store.setData(this._cache);
	}
	public add({ name, id }: { name: string; id?: string }) {
		if (id === undefined) {
			if (this.internalGetByName(name) === undefined) {
				this._cache.push({ name, id });
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
		this._cache.push({ name, id });
		this.write();
		return;
	}
	private internalGetById(id: string) {
		return this._cache.find(item => item.id === id);
	}
	public getById(id: string) {
		const item = this.internalGetById(id);
		if (item === undefined) return null;
		return new MinecraftIdentity(this.server, item.name, item.id);
	}
	private internalGetByName(name: string) {
		return this._cache.find(item => item.name === name);
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
