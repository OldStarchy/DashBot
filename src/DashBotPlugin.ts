import { Permissions } from 'discord.js';
import IdentityService from './ChatServer/IdentityService';
import DashBot from './DashBot';
import StatisticsTracker from './StatisticsTracker';
import StorageRegister from './StorageRegister';

interface DashBotPlugin {
	register(context: DashBotContext): void;
}

class DashBotContext {
	get bot(): DashBot {
		throw new Error('todo');
	}
	get storageFile(): string {
		throw new Error('todo');
	}
	get storage(): StorageRegister {
		throw new Error('todo');
	}
	get identityService(): IdentityService {
		throw new Error('todo');
	}
	get statistics(): StatisticsTracker {
		throw new Error('todo');
	}
	get permissions(): Permissions {
		throw new Error('todo');
	}
}
