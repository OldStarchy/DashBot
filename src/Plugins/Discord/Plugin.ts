import DashBotPlugin, { DashBotContext } from '../../DashBotPlugin';
import DiscordServerFactory from './ChatServer/DiscordServerFactory';

export default class DiscordPlugin extends DashBotPlugin {
	public readonly name = 'Discord Plugin';
	register(context: DashBotContext) {
		context.chatServerFactories['discord'] = serverConfig => {
			return new DiscordServerFactory().make(
				serverConfig as DiscordServerConfig,
				context
			);
		};

		context.logger.info(`${this.name} loaded.`);
	}
}
