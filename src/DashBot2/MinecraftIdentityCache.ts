import { Logger } from 'winston';
import StorageRegister, { PersistentData } from '../StorageRegister';
import IdentityProvider from './IdentityProvider';
import MinecraftIdentity from './MinecraftIdentity';

export default class MinecraftIdentityCache
	implements IdentityProvider<MinecraftIdentity> {
	private cache: {
		name: string;
		id?: string;
	}[] = [];
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
