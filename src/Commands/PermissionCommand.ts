import Identity from '../ChatServer/Identity';
import Message from '../ChatServer/Message';
import Command from '../Command';
import Permissions from '../Permissions';
import Tracery from '../tracery/Tracery';

const grammar = {
	'admin-granted': 'Admin granted to #target.tag#',
	'admin-revoked': 'Admin revoked from #target.tag#',
	'target-not-found': 'Couldn\'t find user "#targetId#"',
};

enum PermissionsPermissions {
	MANAGE_ADMINS = 'permissions.manage-admins',
}

export default class PermissionCommand extends Command {
	readonly name = 'permission';
	readonly description = '(WIP) Handles assigning permissions to people';

	constructor(private readonly permissions: Permissions) {
		super();
	}

	private parseIdentity(identity: Identity, str: string) {
		if (str === 'me') {
			return identity;
		}

		return undefined;
	}
	async run(message: Message | null, _: string, ...args: string[]) {
		if (message === null) {
			return;
		}

		if (args.length < 2) return;

		switch (args[0]) {
			case 'grant':
				switch (args[1]) {
					case 'admin':
						if (
							this.permissions.getAdmins().length === 0 ||
							this.permissions.has(
								await message.author.getPerson(),
								PermissionsPermissions.MANAGE_ADMINS
							)
						) {
							if (args.length !== 3) {
								return;
							}

							const id = this.parseIdentity(
								message.author,
								args[2]
							);
							if (id) {
								const person = await id.getPerson();
								this.permissions.grantAdmin(person);
								await message.channel.sendText(
									Tracery.generate(
										{
											...grammar,
											target: id,
										},
										'admin-granted'
									)
								);
								return;
							}

							Tracery.generate(
								{
									...grammar,
									targetId: Tracery.escape(args[2]),
								},
								'target-not-found'
							);
							return;
						}

						return;

					// TODO: other permissions
					default:
						return;
				}

			case 'revoke':
				switch (args[1]) {
					case 'admin':
						if (
							this.permissions.has(
								await message.author.getPerson(),
								PermissionsPermissions.MANAGE_ADMINS
							)
						) {
							if (args.length !== 3) {
								return;
							}

							const id = this.parseIdentity(
								message.author,
								args[2]
							);
							if (id) {
								const person = await id.getPerson();
								this.permissions.revokeAdmin(person);
								await message.channel.sendText(
									Tracery.generate(
										{
											...grammar,
											target: id,
										},
										'admin-revoked'
									)
								);
								return;
							}

							Tracery.generate(
								{
									...grammar,
									targetId: Tracery.escape(args[2]),
								},
								'target-not-found'
							);
							return;
						}
						return;
				}

			default:
				return;
		}
	}
}
