import { Event, EventEmitter } from '../../../Events';
import MojangApiClient from '../../../MojangApiClient';
import StorageRegister, { PersistentData } from '../../../StorageRegister';

export class MinecraftUser {
	constructor(public uuid: string, public username: string) {}
}

interface MinecraftUserData {
	username: string;
	uuid: string;
}
interface MinecraftIdentityCacheDependencies {
	storage: StorageRegister;
	mojangApiClient: MojangApiClient;
}
export default class MinecraftIdentityCache extends EventEmitter<{
	identityChanged: Record<'id' | 'username' | 'oldName', string>;
}> {
	private _store: PersistentData<MinecraftUserData[]>;
	private _mojangApiClient: MojangApiClient;

	constructor({
		storage,
		mojangApiClient,
	}: MinecraftIdentityCacheDependencies) {
		super();
		this._store = storage.createStore('MinecraftIdentityCache', false);
		this._mojangApiClient = mojangApiClient;
	}

	public add({ username, uuid }: MinecraftUserData) {
		const data = this.getData();

		uuid = uuid.replace(/-/g, '');

		const item = data.find(data => data.uuid === uuid);
		if (item) {
			if (item.username !== username) {
				this.emit(
					new Event('identityChanged', {
						id: uuid,
						username,
						oldName: item.username,
					})
				);
			}
			item.username = username;
			this.setData(data);
			return this.userDataToUser(item);
		}

		this.setData([...data, { username, uuid }]);
		return this.userDataToUser({ username, uuid });
	}

	private getData() {
		return this._store.getData(() => []);
	}

	private setData(data: Readonly<MinecraftUserData[]>) {
		this._store.setData(data);
	}

	public async addByName(username: string) {
		const id = await this.fetchIdentity(username);

		if (!id) return null;

		return this.add(id);
	}

	public async fetchIdentity(username: string) {
		if (!this._mojangApiClient) return null;

		const userData = await this._mojangApiClient.getUuidFromUsername(
			username
		);

		if (userData) {
			const { name, id } = userData;
			return { username: name, uuid: id.replace(/-/g, '') };
		}

		return null;
	}

	private userDataToUser(data: MinecraftUserData) {
		return new MinecraftUser(data.uuid, data.username);
	}

	public getById(id: string) {
		const data = this.getData();

		const userData = data.find(item => item.uuid === id);

		if (userData) {
			return this.userDataToUser(userData);
		}

		return null;
	}

	public getByUsername(username: string) {
		const data = this.getData();

		const userData = data.find(item => item.username === username);

		if (userData) {
			return this.userDataToUser(userData);
		}

		return null;
	}
}
