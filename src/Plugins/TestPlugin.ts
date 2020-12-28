import winston from 'winston';
import DashBotPlugin, { DashBotContext } from '../DashBotPlugin';

export default class TestPlugin extends DashBotPlugin {
	public readonly name = 'Test Plugin';
	register(_context: DashBotContext) {
		winston.info(`${this.name} loaded.`);
	}
}