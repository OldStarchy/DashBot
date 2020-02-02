import { Message } from 'discord.js';
import { Action } from '../Action';

export abstract class OngoingAction<TState> extends Action {
	private session: {
		[channelUserId: string]: TState;
	} = {};

	// TODO: Make TState readonly
	protected getSession(message: Message, def: TState): TState;
	protected getSession(id: string, def: TState): TState;
	protected getSession(messageOrId: Message | string, def: TState): TState {
		let id = '';
		if (typeof messageOrId === 'string') {
			id = messageOrId;
		} else {
			id = messageOrId.channel.id + '/' + messageOrId.author.id;
		}
		if (this.session[id] !== undefined) return this.session[id];
		return (this.session[id] = def);
	}
}
