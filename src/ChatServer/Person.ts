import ChatServer from './ChatServer';
import Identity from './Identity';

export default class Person {
	constructor(private readonly _identities: Record<string, Identity>) {}

	async getPrivateTextChannel(preferredServer?: ChatServer) {
		if (preferredServer) {
			const channel = await preferredServer.getPrivateTextChannel(
				this._identities[preferredServer.id]
			);
			if (channel) return channel;
		}

		for (const serverId of Object.keys(this._identities)) {
			const identity = this._identities[serverId];
			const server = identity.server;

			if (server.id !== preferredServer?.id) {
				const channel = await server.getPrivateTextChannel(identity);
				if (channel) return channel;
			}
		}

		return null;
	}

	getIds() {
		const ids: Record<string, string> = {};

		for (const serverId in this._identities) {
			if (this._identities.hasOwnProperty(serverId)) {
				const identity = this._identities[serverId];

				ids[serverId] = identity.id;
			}
		}

		return ids;
	}
}
