import { Event, EventEmitter, EventHandler } from '../../../Events';

export class BusyLockKey extends EventEmitter {
	private _cancelled = false;
	constructor(readonly priority: number, readonly release: () => void) {
		super();
		this.on('cancelled', () => {
			this._cancelled = true;
		});
	}

	get cancelled() {
		return this._cancelled;
	}

	on(event: 'cancelled', handler: EventHandler<void>): void {
		super.on(event, handler);

		if (this.cancelled) {
			handler(new Event('cancelled', void 0));
		}
	}
}

export default class BusyLock {
	private _current: BusyLockKey | null = null;

	getBusyLock(priority: number) {
		if (this._current && this._current.priority >= priority) {
			return null;
		}

		if (this._current) {
			this._current.emit(new Event<void>('cancelled', void 0));
		}

		const key = new BusyLockKey(priority, () => {
			if (this._current && this._current === key) {
				this._current = null;
			}
		});

		return (this._current = key);
	}

	isBusy(priority?: number) {
		if (this._current === null) return false;

		if (priority !== undefined) return this._current.priority < priority;

		return true;
	}

	stop(priority: number) {
		if (this._current && this._current.priority >= priority) {
			return false;
		}

		if (this._current) {
			this._current.emit(new Event<void>('cancelled', void 0));
			this._current = null;
		}

		return true;
	}
}
