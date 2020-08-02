import winston from 'winston';
import DashBotPlugin, { DashBotContext } from '../../DashBotPlugin';
import MinecraftServerFactory from './ChatServer/MinecraftServerFactory';
import BrewingCommand from './Commands/BrewingCommand';
import MinecraftGreetInteraction from './Interactions/MinecraftGreetInteraction';
import MinecraftRelayService from './Services/MinecraftRelayService';

export default class MinecraftPlugin extends DashBotPlugin {
	public readonly name = 'Minecraft Plugin';
	register(context: DashBotContext) {
		new MinecraftGreetInteraction().register(context.bot);

		context.bot.commands.add(new BrewingCommand());
		context.chatServerFactories['minecraft'] = serverConfig => {
			return new MinecraftServerFactory().make(
				serverConfig as MinecraftServerConfig,
				context
			);
		};

		const minecraftRelayService = new MinecraftRelayService(
			context.identityService,
			context.storage
		);

		minecraftRelayService.register(context.bot);

		winston.info(`${this.name} loaded.`);
	}
}
