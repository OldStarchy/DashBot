import StorageRegister, { PersistentData } from '../StorageRegister';
import Message from './Message';

/**
 * Keeps a state object based on the message channel ID and the message author ID.
 */
export default class SessionStore<TState> {
	constructor(protected readonly storage: StorageRegister) {}

	public getSession(message: Message): PersistentData<TState> {
		const id =
			message.getChannel().getId() + '/' + message.getAuthor().getId();

		return this.storage.createStore<TState>(`Session-${id}`, false);
	}
}
