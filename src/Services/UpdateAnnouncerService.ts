import changeLog from '../changeLog';
import IdentityService from '../ChatServer/IdentityService';
import Message from '../ChatServer/Message';
import TextChannel from '../ChatServer/TextChannel';
import Command from '../Command';
import DashBot from '../DashBot';
import getVersion from '../getVersion';
import Permissions from '../Permissions';
import Service from '../Service';
import StorageRegister, { PersistentData } from '../StorageRegister';
import Tracery from '../tracery/Tracery';
import compareSemVer from '../util/compareSemVer';

const grammar = {
	'new-version': [
		"A new version of my code has been deployed! I'm now running #version#",
		'I just got an update to #version#!',
		'Another day, another version release; now running #version#.',
	],
	'channel-set-here': "I'll send update announcements here from now on.",
	'channel-cleared': "OK, I'll stop sending update announcements here.",
};

enum UpdateAnnouncerServicePermissions {
	SET_CHANNEL = 'updateAnnouncer.setChannel',
}

interface UpdateAnnouncerServiceData {
	version: string;
	channel: {
		serverId: string;
		channelId: string;
	} | null;
}

export default class UpdateAnnouncerService implements Service {
	private _store: PersistentData<UpdateAnnouncerServiceData>;

	constructor(
		storage: StorageRegister,
		private identityService: IdentityService,
		private permissions: Permissions
	) {
		this._store = storage.createStore('UpdateAnnouncer', false);
	}
	register(bot: DashBot) {
		bot.on('connected', this.onConnected.bind(this));
	}

	private getData() {
		return this._store.getData(() => ({
			version: '',
			channel: null,
		}));
	}

	private async onConnected() {
		const previousVersion = this.getData().version;

		if (previousVersion !== getVersion()) {
			const channel = await this.getChannel();
			if (channel) {
				this.announceUpdate(channel, getVersion(), previousVersion);
			}

			this._store.setData({
				...this.getData(),
				version: getVersion(),
			});
		}
	}

	private setChannel(channel: TextChannel | null) {
		this._store.setData({
			...this.getData(),
			channel:
				channel === null
					? null
					: {
							serverId: channel.server.id,
							channelId: channel.id,
					  },
		});
	}

	private async getChannel() {
		const channelData = this.getData().channel;

		if (!channelData) return null;
		const server = this.identityService.getServer(channelData.serverId);
		if (!server) return null;
		const channel = await server?.getTextChannel(channelData.channelId);
		return channel;
	}

	private async announceUpdate(
		channel: TextChannel,
		newVersion: string,
		previousVersion?: string
	) {
		if (channel) {
			if (previousVersion) {
				const versionHistory = Object.keys(changeLog);
				versionHistory.sort(compareSemVer);

				for (const version of versionHistory) {
					if (compareSemVer(version, previousVersion) > 0) {
						await this.printVersionDetails(
							channel,
							version,
							changeLog[version]
						);
					}
				}
				return;
			}
			const newVersionNoDev = newVersion.replace(/(^v|@dev$)/g, '');
			if (changeLog[newVersionNoDev]) {
				const changes = changeLog[newVersionNoDev];
				await this.printVersionDetails(channel, newVersion, changes);
			}
		}
	}

	private async printVersionDetails(
		channel: TextChannel,
		newVersion: string,
		changes: {
			Added?: string[] | undefined;
			Updated?: string[] | undefined;
			Removed?: string[] | undefined;
			Fixed?: string[] | undefined;
		}
	) {
		let updates = '';

		await channel.sendText(
			Tracery.generate(
				{
					...grammar,
					version: newVersion,
				},
				'new-version'
			)
		);
		(Object.keys(changes) as (keyof typeof changes)[]).forEach(header => {
			if (changes[header]!.length > 0) {
				updates +=
					[
						header + ':',
						...changes[header]!.map(change => ' * ' + change),
					].join('\n') + '\n';
			}
		});

		await channel.sendText(updates.trimEnd());
	}

	getCommand() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		class SetChannelCommand extends Command {
			readonly name = 'announce';
			readonly description = 'Shows the current version changelog';
			async run(message: Message, here?: string) {
				if (here === 'here') {
					if (
						self.permissions.has(
							await message.author.getPerson(),
							UpdateAnnouncerServicePermissions.SET_CHANNEL
						)
					) {
						if ((await self.getChannel()) === null) {
							self.setChannel(message.channel);

							message.channel.sendText(
								Tracery.generate(grammar, 'channel-set-here')
							);
						} else {
							self.setChannel(null);
							message.channel.sendText(
								Tracery.generate(grammar, 'channel-cleared')
							);
						}
					}
				} else {
					const channel = await self.getChannel();
					if (channel) {
						self.announceUpdate(channel, getVersion());
					}
				}
			}
		}

		return new SetChannelCommand();
	}
}
