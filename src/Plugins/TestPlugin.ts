import winston from 'winston';
import DashBotPlugin, { DashBotContext } from '../DashBotPlugin';

export default class TestPlugin extends DashBotPlugin {
	public readonly name = 'Test Plugin';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	register(_context: DashBotContext) {
		winston.info(`${this.name} loaded.`);
	}
}
