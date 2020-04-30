import DashBotPlugin, { DashBotContext } from '../DashBotPlugin';

export default class TestPlugin extends DashBotPlugin {
	public readonly name = 'Test Plugin';
	register(context: DashBotContext) {
		context.logger.info(`${this.name} loaded.`);
	}
}
