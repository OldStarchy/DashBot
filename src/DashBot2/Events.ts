export class Event<TData> {
	private cancelled = false;
	constructor(
		public readonly event: string,
		public data: TData,
		public readonly cancellable: boolean = true
	) {}

	isCancelled() {
		return this.cancelled;
	}

	cancel() {
		this.cancelled = this.cancellable;
	}
}

export type EventHandler<TData = unknown> = (event: Event<TData>) => void;

export class EventEmitter {
	private eventHandlers: {
		[eventName: string]: EventHandler<any>[];
	} = {};

	emit(event: Event<unknown>) {
		if (!this.eventHandlers[event.event]) {
			return event;
		}

		for (const handler of this.eventHandlers[event.event]) {
			handler(event);

			if (event.isCancelled()) {
				return event;
			}
		}
	}

	on(event: string, handler: EventHandler<any>) {
		return this._on(event, handler);
	}

	private _on(event: string, handler: EventHandler<any>) {
		if (!this.eventHandlers[event]) {
			this.eventHandlers[event] = [];
		}

		this.eventHandlers[event].push(handler);
	}

	off(event: string, handler: EventHandler<any>) {
		return this._off(event, handler);
	}

	private _off(event: string, handler: EventHandler<any>) {
		if (!this.eventHandlers[event]) {
			return;
		}

		const index = this.eventHandlers[event].findIndex(h => h === handler);
		if (index >= 0) {
			this.eventHandlers[event].splice(index, 1);
		}
	}
}
