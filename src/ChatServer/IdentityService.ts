import { EventForEmitter } from '../Events';
import StorageRegister, { PersistentData } from '../StorageRegister';
import ChatServer from './ChatServer';
import Identity from './Identity';
import Person from './Person';

export interface PersonIdentityMap {
	identities: { [serverId: string]: string };
}

export default class IdentityService {
	private _store: PersistentData<PersonIdentityMap[]>;
	private _people: PersonIdentityMap[];
	private readonly _servers: ChatServer[] = [];

	constructor(storage: StorageRegister) {
		this._store = storage.createStore('IdentityMap');
		this._store.on('dataLoaded', this.onDataLoaded.bind(this));

		this._people = [];
	}

	private onDataLoaded(
		event: EventForEmitter<IdentityService['_store'], 'dataLoaded'>
	) {
		const data = event.data;
		if (data === undefined) {
			return;
		}

		this._people = data.map((id) => ({ identities: { ...id.identities } }));
	}

	async getById(serverId: string, id: string) {
		const person = this._people.find(
			(person) => person.identities[serverId] === id
		);

		const identities: Record<string, Identity> = {};

		if (person) {
			for (const serverId of Object.keys(person.identities)) {
				const identity = await this._servers
					.find((server) => server.id == serverId)
					?.getIdentityById(person.identities[serverId]);

				if (identity) {
					identities[serverId] = identity;
				}
			}

			return new Person(identities);
		}

		const server = this._servers.find((server) => server.id === serverId);

		if (server) {
			const identity = await server.getIdentityById(id);

			if (identity) {
				this._people.push({
					identities: {
						[serverId]: id,
					},
				});
				this._store.setData(this._people);

				return new Person({
					[serverId]: identity,
				});
			}
		}

		throw new Error("Couldn't create person from identity");
	}

	addProvider(server: ChatServer) {
		this._servers.push(server);
	}

	getServer(id: string) {
		return this._servers.find((server) => server.id === id) || null;
	}
}
