import Person from './ChatServer/Person';
import StorageRegister, { PersistentData } from './StorageRegister';

interface PermissionsData {
	/**
	 * List of Identity IDs
	 */
	admins: string[];
}
export default class Permissions {
	static readonly defaultData: PermissionsData = { admins: [] };
	private _store: PersistentData<PermissionsData>;

	constructor(storage: StorageRegister) {
		this._store = storage.createStore('Permissions', true);
	}

	private getData() {
		return this._store.getData(() => ({ admins: [] }));
	}

	public getAdmins() {
		return this.getData().admins;
	}

	public isAdmin(person: Person) {
		const ids = Object.values(person.getIds());

		return ids.some((id) =>
			this.getData().admins.some((admin) => admin === id)
		);
	}

	public grantAdmin(person: Person) {
		const ids = person.getIds();

		const admins = this.getData().admins;

		let changed = false;

		Object.values(ids).forEach((id) => {
			if (!admins.includes(id)) {
				admins.push(id);
				changed = true;
			}
		});

		if (changed) {
			this._store.setData({
				admins,
			});
		}
	}

	public revokeAdmin(person: Person) {
		const ids = person.getIds();

		const admins = this.getData().admins;

		let changed = false;

		Object.values(ids).forEach((id) => {
			const index = admins.findIndex((admin) => admin === id);
			if (index >= 0) {
				admins.splice(index, 1);
				changed = true;
			}
		});

		if (changed) {
			this._store.setData({
				admins,
			});
		}
	}

	public has(person: Person, permission: string): boolean {
		if (this.isAdmin(person)) {
			return true;
		}

		// TODO: Permissions
		permission;

		return false;
	}
}
