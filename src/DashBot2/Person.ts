import Identity from './Identity';
import ChatServer from './Server';

export default class Person {
	constructor(private readonly identities: Record<string, Identity>) {}

	async getPrivateTextChannel(preferredServer?: ChatServer) {
		if (preferredServer) {
			const channel = await preferredServer.getPrivateTextChannel(
				this.identities[preferredServer.id]
			);
			if (channel) return channel;
		}

		for (const serverId of Object.keys(this.identities)) {
			const identity = this.identities[serverId];
			const server = identity.getServer();

			if (server.id !== preferredServer?.id) {
				const channel = await server.getPrivateTextChannel(identity);
				if (channel) return channel;
			}
		}

		return null;
	}
}
