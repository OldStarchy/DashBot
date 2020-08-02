export class Event<TEventName extends string, TData> {
	constructor(public readonly event: TEventName, public data: TData) {}

	isCancelled() {
		return false;
	}

	cancel() {
		throw new Error('Cannot cancel a non-cancellable event');
	}
}

export class CancellableEvent<TEventName extends string, TData> extends Event<
	TEventName,
	TData
> {
	private _cancelled = false;

	isCancelled() {
		return this._cancelled;
	}

	cancel() {
		this._cancelled = true;
	}
}

export type EventHandler<TEventName extends string, TData> = (
	event: Event<TEventName, TData> | CancellableEvent<TEventName, TData>
) => void | Promise<void>;

export type EventsFromEmitter<TEmitter> = TEmitter extends EventEmitter<
	infer TEvents
>
	? TEvents
	: never;
export type EventForEmitter<
	TEmitter,
	TEventName extends keyof EventsFromEmitter<TEmitter> & string
> = Event<TEventName, EventsFromEmitter<TEmitter>[TEventName]>;

export type EventHandlerForEmitter<
	TEmitter,
	TEventName extends keyof EventsFromEmitter<TEmitter> & string
> = EventHandler<TEventName, EventsFromEmitter<TEmitter>[TEventName]>;

export class EventEmitter<TEvents> {
	// https://github.com/microsoft/TypeScript/issues/1396#issuecomment-66071124
	// TODO: Once noUnusedLocals is enabled in tsconfig add @ts-expect-error here
	private readonly _typeHint_events!: TEvents;

	private eventHandlers: {
		[eventName: string]: {
			handler: EventHandler<string, TEvents[keyof TEvents & string]>;
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

	protected emit<TEventName extends keyof TEvents & string>(
		event: Event<TEventName, TEvents[TEventName]>
	) {
		const events = EventEmitter.extractEventTypes(event.event);

		events
			.map(eventName => this.eventHandlers[eventName])
			.filter(handlers => handlers && handlers.length > 0)
			.map(handlers => handlers.map(handler => handler.handler))
			.forEach(handlers => this.internalEmit(event, handlers));

		return event;
	}
	private internalEmit<TEventName extends keyof TEvents & string>(
		event: Event<TEventName, TEvents[TEventName]>,
		handlers: EventHandler<TEventName, TEvents[TEventName]>[]
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

	protected async emitAsync<TEventName extends keyof TEvents & string>(
		event: Event<TEventName, TEvents[TEventName]>
	) {
		const events = EventEmitter.extractEventTypes(event.event);

		const handlerss = events
			.map(eventName => this.eventHandlers[eventName])
			.filter(handlers => handlers && handlers.length > 0)
			.map(handlers => handlers.map(handler => handler.handler));

		for (const handlers of handlerss) {
			await this.internalEmitAsync(event, handlers);
		}

		return event;
	}

	private async internalEmitAsync<TEventName extends keyof TEvents & string>(
		event: Event<TEventName, TEvents[TEventName]>,
		handlers: EventHandler<TEventName, TEvents[TEventName]>[]
	) {
		if (event instanceof CancellableEvent) {
			for (const handler of handlers) {
				const result = handler(event);

				if (result instanceof Promise) {
					await result;
				}

				if (event.isCancelled()) {
					return;
				}
			}
		} else {
			for (const handler of handlers) {
				const result = handler(event);

				if (result instanceof Promise) {
					await result;
				}
			}
		}
	}

	on<TEventName extends keyof TEvents & string>(
		event: TEventName,
		handler: EventHandler<TEventName, TEvents[TEventName]>,
		key: any = null
	) {
		return this._on(event, handler, key !== null ? key : handler);
	}

	private _on<TEventName extends keyof TEvents & string>(
		event: TEventName,
		handler: EventHandler<TEventName, TEvents[TEventName]>,
		key: any
	) {
		if (!this.eventHandlers[event]) {
			this.eventHandlers[event] = [];
		}

		this.eventHandlers[event].push({
			handler: handler as EventHandler<string, any>,
			key,
		});
	}

	off<TEventName extends keyof TEvents & string>(
		event: TEventName,
		key: any
	) {
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

	public once<TEventName extends keyof TEvents & string>(
		event: TEventName,
		handler: EventHandler<TEventName, TEvents[TEventName]>,
		key: any = null
	) {
		return this._once(event, handler, key !== null ? key : handler);
	}

	private _once<TEventName extends keyof TEvents & string>(
		event: TEventName,
		handler: EventHandler<TEventName, TEvents[TEventName]>,
		key: any
	) {
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

export interface EventEmitter<TEvents> {
	on<TEventName extends keyof TEvents & string>(
		event: TEventName,
		handler: EventHandler<TEventName, TEvents[TEventName]>,
		key: any
	): void;

	once<TEventName extends keyof TEvents & string>(
		event: TEventName,
		handler: EventHandler<TEventName, TEvents[TEventName]>,
		key?: any
	): void;

	off<TEventName extends keyof TEvents & string>(
		event: TEventName,
		key: any
	): void;
}

/**
 * An event emitter that exposes its emit functions publicly
 */
export class PublicEventEmitter<TEvents> extends EventEmitter<TEvents> {
	public emit = super.emit;
	public emitAsync = super.emitAsync;
}
