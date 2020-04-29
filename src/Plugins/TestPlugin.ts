import DashBotPlugin, { DashBotContext } from '../DashBotPlugin';

export default class TestPlugin extends DashBotPlugin {
	register(context: DashBotContext) {
		context.logger.info('TestPlugin loaded');
	}
}
