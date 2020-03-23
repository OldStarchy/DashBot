import { existsSync, readFileSync, writeFileSync } from 'fs';

export interface Event {
	channel: string;
	source: string;
	event: string;
	target?: string;
}

export class StatTracker {
	private constructor(private readonly stateFile: string) {}

	static load(file: string) {
		if (existsSync(file)) {
			const serializedData = readFileSync(file, 'utf8');
			const data = JSON.parse(serializedData);

			if (!data.version) {
				return StatTracker.loadV0(file, data);
			} else {
				throw new Error(
					'Unrecognised version number in statistics file'
				);
			}
		} else {
			return new StatTracker(file);
		}
	}
	private static loadV0(
		file: string,
		data: {
			events?: {};
			userTriggeredEvents?: {};
		}
	) {
		const tracker = new StatTracker(file);
		tracker.events = data.events || {};
		tracker.userTriggeredEvents = data.userTriggeredEvents || {};
		return tracker;
	}

	startTrackingTime = Date.now();

	userTriggeredEvents: {
		[userName: string]: { [eventType: string]: number };
	} = {};

	events: {
		[eventType: string]: number;
	} = {};

	recordUserTriggeredEvent(username: string, eventType: string): void {
		this.userTriggeredEvents[username] =
			this.userTriggeredEvents[username] || {};

		this.userTriggeredEvents[username][eventType] =
			(this.userTriggeredEvents[username][eventType] || 0) + 1;

		this.recordEvent(eventType);
	}

	recordEvent(eventType: string): void {
		this.events[eventType] = (this.events[eventType] || 0) + 1;

		const data = {
			events: this.events,
			userTriggeredEvents: this.userTriggeredEvents,
		};

		const serializedData = JSON.stringify(data);
		writeFileSync(this.stateFile, serializedData);
	}
}
