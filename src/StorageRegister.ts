import fs from 'fs';
import { Logger } from 'winston';
import { Event, EventEmitter, EventHandler } from './DashBot2/Events';
import Storage from './Storage';

export interface DataStore<TData> {
	setData(data: TData): void;
	getData(): TData | undefined;

	on(event: 'dataLoaded', handler: EventHandler<TData | undefined>): void;
	emit(event: Event<TData | undefined>): void;
}

export class PersistentData<TData> extends EventEmitter
	implements DataStore<TData> {
	constructor(
		private readonly name: string,
		private readonly register: StorageRegister
	) {
		super();
	}
	setData(data: TData): void {
		this.register.setData(this.name, data);
	}

	getData(): TData | undefined {
		return this.register.getData(this.name) as TData;
	}

	on(event: 'dataLoaded', handler: EventHandler<TData>): void {
		super.on(event, handler);
	}

	emit(event: Event<TData | undefined>): Event<TData | undefined> {
		return super.emit(event) as Event<TData | undefined>;
	}
}

export default class StorageRegister {
	private storage: Storage<Record<string, unknown>>;
	private stores: Record<string, PersistentData<unknown>> = {};
	private data: Record<string, unknown> = {};
	private fileWatcher: fs.FSWatcher | null = null;
	private changeTimeout: NodeJS.Timeout | null = null;

	constructor(file: string, private readonly logger: Logger) {
		this.storage = new Storage(file, () => ({}));

		this.load();
	}

	watch() {
		if (this.fileWatcher === null) {
			this.fileWatcher = fs.watch(
				this.storage.file,
				this.onChange.bind(this)
			);
		}
	}

	stopWatching() {
		this.fileWatcher?.close();
		this.fileWatcher = null;
	}

	private onChange(/* event: string, filename: string */) {
		if (this.changeTimeout !== null) {
			clearTimeout(this.changeTimeout);
		}

		this.changeTimeout = setTimeout(this.onChangeTimeout.bind(this), 2000);
	}

	private onChangeTimeout() {
		this.changeTimeout = null;
		this.load();
	}

	createStore<T>(key: string) {
		const store = new PersistentData<T>(key, this);
		this.stores[key] = store;

		if (this.data[key]) {
			try {
				store.emit(new Event('dataLoaded', this.data[key] as T));
			} catch (e) {
				this.logger.error(e);
			}
		}
		return store;
	}

	load() {
		this.data = this.storage.getData();

		for (const key in this.stores) {
			if (this.stores.hasOwnProperty(key)) {
				const store = this.stores[key];

				if (this.data[key]) {
					try {
						store.emit(new Event('dataLoaded', this.data[key]));
					} catch (e) {
						this.logger.error(e);
					}
				}
			}
		}
	}

	setData(key: string, data: unknown) {
		this.data[key] = data;

		this.storage.setData(this.data);
	}

	getData(key: string) {
		return this.data[key];
	}
}
