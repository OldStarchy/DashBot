import StorageRegister, { PersistentData } from '../StorageRegister';
import { Event } from './Events';
import Identity from './Identity';
import Person from './Person';
import ChatServer from './Server';

export interface PersonIdentityMap {
	identities: { [serverId: string]: string };
}

export default class IdentityService {
	private store: PersistentData<PersonIdentityMap[]>;
	private people: PersonIdentityMap[];
	private readonly servers: ChatServer[] = [];

	constructor(storage: StorageRegister) {
		this.store = storage.createStore('IdentityMap');
		this.store.on('dataLoaded', this.onDataLoaded.bind(this));

		this.people = [];
	}

	private onDataLoaded(event: Event<PersonIdentityMap[] | undefined>) {
		const data = event.data;
		if (data === undefined) {
			return;
		}

		this.people = data.map(id => ({ identities: { ...id.identities } }));
	}

	getById(serverId: string, id: string) {
		const person = this.people.find(
			person => person.identities[serverId] === id
		);

		const identities: Record<string, Identity> = {};

		if (person) {
			for (const serverId of Object.keys(person.identities)) {
				const identity = this.servers
					.find(server => server.id == serverId)
					?.getIdentityById(person.identities[serverId]);

				if (identity) {
					identities[serverId] = identity;
				}
			}

			return new Person(identities);
		}

		const server = this.servers.find(server => server.id === serverId);

		if (server) {
			const identity = server.getIdentityById(id);

			if (identity) {
				this.people.push({
					identities: {
						[serverId]: id,
					},
				});
				this.store.setData(this.people);

				return new Person({
					[serverId]: identity,
				});
			}
		}

		throw new Error("Couldn't create person from identity");
	}

	addProvider(server: ChatServer) {
		this.servers.push(server);
	}
}
