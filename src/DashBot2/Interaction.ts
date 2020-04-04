import DashBot from './DashBot';

export default interface Interaction {
	register(bot: DashBot): void;
}
