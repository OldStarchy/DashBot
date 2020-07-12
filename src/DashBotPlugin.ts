import ChatServer from './ChatServer/ChatServer';
import IdentityService from './ChatServer/IdentityService';
import DashBot from './DashBot';
import Permissions from './Permissions';
import StatisticsTracker from './StatisticsTracker';
import StorageRegister from './StorageRegister';

export default abstract class DashBotPlugin {
	abstract register(context: DashBotContext): void;
	abstract get name(): string;
}

export class DashBotContext {
	public readonly chatServerFactories: Record<
		string,
		(context: ChatServerConfig) => ChatServer
	> = {};

	constructor(
		public readonly bot: DashBot,
		public readonly storage: StorageRegister,
		public readonly identityService: IdentityService,
		public readonly statistics: StatisticsTracker,
		public readonly permissions: Permissions,
		public readonly config: DashBotConfig,
		public readonly storageDir: string,
		public readonly packageRoot: string
	) {}
}
