import { existsSync, readFileSync, writeFileSync } from 'fs';

export interface Event {
	channel: string;
	source: string;
	event: string;
	target?: string;
}

export class StatTracker {
	constructor(private readonly stateFile: string) {
		if (existsSync(this.stateFile)) {
			const serializedData = readFileSync(this.stateFile, 'utf8');
			const data = JSON.parse(serializedData);

			this.events = data.events || {};
			this.userTriggeredEvents = data.userTriggeredEvents || {};
		}
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
