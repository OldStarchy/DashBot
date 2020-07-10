import DashBotPlugin, { DashBotContext } from '../../DashBotPlugin';
import MinecraftServerFactory from './ChatServer/MinecraftServerFactory';
import BrewingCommand from './Commands/BrewingCommand';
import MinecraftGreetInteraction from './Interactions/MinecraftGreetInteraction';
import MinecraftRelayService from './Services/MinecraftRelayService';

export default class MinecraftPlugin extends DashBotPlugin {
	public readonly name = 'Minecraft Plugin';
	register(context: DashBotContext) {
		new MinecraftGreetInteraction(context.logger).register(context.bot);

		context.bot.registerCommand('brewing', new BrewingCommand());
		context.chatServerFactories['minecraft'] = serverConfig => {
			return new MinecraftServerFactory().make(
				serverConfig as MinecraftServerConfig,
				context.storage,
				context.identityService,
				context.config,
				context.storageDir,
				context.packageRoot,
				context.logger
			);
		};

		const minecraftRelayService = new MinecraftRelayService(
			context.identityService,
			context.storage
		);

		minecraftRelayService.register(context.bot);

		context.logger.info(`${this.name} loaded.`);
	}
}
