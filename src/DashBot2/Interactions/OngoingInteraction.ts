import { PersistentData } from '../../StorageRegister';
import { DashBot2 } from '../DashBot2';
import Interaction from '../Interaction';
import Message from '../Message';

/**
 * Keeps a state object based on the message channel ID and the message author ID.
 */
export abstract class OngoingInteraction<TState> implements Interaction {
	constructor(
		protected readonly store: PersistentData<Record<string, TState>>
	) {}

	protected getSession(message: Message, def: () => TState): TState;
	protected getSession(id: string, def: () => TState): TState;
	protected getSession(
		messageOrId: Message | string,
		def: () => TState
	): TState {
		let id = '';
		if (typeof messageOrId === 'string') {
			id = messageOrId;
		} else {
			id =
				messageOrId.getChannel().getId() +
				'/' +
				messageOrId.getAuthor().getId();
		}
		let data = this.store.getData();
		if (data === undefined) {
			this.store.setData({});
		}

		data = this.store.getData()!;
		if (data[id] !== undefined) return data[id];
		return (data[id] = def());
	}

	abstract register(bot: DashBot2): void;
}
