export class Event<TData> {
	constructor(public readonly event: string, public data: TData) {}

	isCancelled() {
		return false;
	}

	cancel() {
		throw new Error('Cannot cancel a non-cancellable event');
	}
}

export class CancellableEvent<TData> extends Event<TData> {
	private _cancelled = false;

	isCancelled() {
		return this._cancelled;
	}

	cancel() {
		this._cancelled = true;
	}
}

export type EventHandler<TData = unknown> = (event: Event<TData>) => void;

export class EventEmitter {
	private eventHandlers: {
		[eventName: string]: {
			handler: EventHandler<any>;
			key: any;
		}[];
	} = {};

	/**
	 * Convert 'foo.bar.baz' to ['foo.bar.baz', 'foo.bar.*', 'foo.*', '*']
	 */
	private static extractEventTypes(event: string) {
		const eventParts = event.split('.');
		const events: string[] = [];
		events.push(eventParts.join('.'));
		while (eventParts.length > 0) {
			eventParts.pop();
			events.push([...eventParts, '*'].join('.'));
		}

		return events;
	}

	emit<T = unknown>(event: Event<T>) {
		const events = EventEmitter.extractEventTypes(event.event);

		events
			.map(eventName => this.eventHandlers[eventName])
			.filter(handlers => handlers && handlers.length > 0)
			.map(handlers => handlers.map(handler => handler.handler))
			.forEach(handlers => this.internalEmit(event, handlers));

		return event;
	}

	private internalEmit<T = unknown>(
		event: Event<T>,
		handlers: EventHandler<any>[]
	) {
		if (event instanceof CancellableEvent) {
			for (const handler of handlers) {
				handler(event);

				if (event.isCancelled()) {
					return;
				}
			}
		} else {
			for (const handler of handlers) {
				handler(event);
			}
		}
	}

	on(event: string, handler: EventHandler<any>, key: any | null = null) {
		return this._on(event, handler, key !== null ? key : handler);
	}

	private _on(event: string, handler: EventHandler<any>, key: any) {
		if (!this.eventHandlers[event]) {
			this.eventHandlers[event] = [];
		}

		this.eventHandlers[event].push({ handler, key });
	}

	off(event: string, key: any) {
		return this._off(event, key);
	}

	private _off(event: string, key: any) {
		if (!this.eventHandlers[event]) {
			return;
		}

		let index: number;
		do {
			index = this.eventHandlers[event].findIndex(h => h.key === key);
			if (index >= 0) {
				this.eventHandlers[event].splice(index, 1);
			}
		} while (index >= 0);
	}

	public once(
		event: string,
		handler: EventHandler<any>,
		key: any | null = null
	) {
		return this._once(event, handler, key !== null ? key : handler);
	}

	private _once(event: string, handler: EventHandler<any>, key: any) {
		this.on(
			event,
			e => {
				this.off(event, key);
				handler(e);
			},
			key
		);
	}
}
