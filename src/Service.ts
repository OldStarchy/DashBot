import DashBot from './DashBot';

export default interface Service {
	register(bot: DashBot): void;
}
