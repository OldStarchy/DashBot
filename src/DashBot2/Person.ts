import Identity from './Identity';
import ChatServer from './Server';

export default class Person {
	constructor(private readonly identities: Record<string, Identity>) {}

	async getPrivateTextChannel(preferredServer?: ChatServer) {
		if (preferredServer) {
			const channel = await preferredServer.getPrivateTextChannel(
				this.identities[preferredServer.getId()]
			);
			if (channel) return channel;
		}

		for (const serverId of Object.keys(this.identities)) {
			const identity = this.identities[serverId];
			const server = identity.getServer();

			if (server.getId() !== preferredServer?.getId()) {
				const channel = await server.getPrivateTextChannel(identity);
				if (channel) return channel;
			}
		}

		return null;
	}
}
