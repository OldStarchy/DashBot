import DashBotPlugin, { DashBotContext } from '../../DashBotPlugin';
import MineflayerClient, {
	MineflayerOptions,
} from './ChatServer/MineflayerClient';

export default class MineflayerPlugin extends DashBotPlugin {
	public readonly name: string = 'Mineflayer';

	register(context: DashBotContext) {
		context.chatServerFactories['mineflayer'] = (
			config: ChatServerConfig
		) => {
			const {
				host,
				port,
				username,
				password,
			} = config as MineflayerConfig;

			const options: MineflayerOptions = {
				host,
				port,
				username,
				password,
				logger: context.logger,
				identityService: context.identityService,
			};

			return new MineflayerClient(options);
		};
	}
}
