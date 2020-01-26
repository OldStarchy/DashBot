export class StatTracker {
	startTrackingTime = Date.now();
	userTriggeredEvents: {
		[userName: string]: { [eventType: string]: number };
	} = {};
	events: {
		[eventType: string]: number;
	} = {};

	recordUserTriggeredEvent(username: string, eventType: string) {
		this.userTriggeredEvents[username] =
			this.userTriggeredEvents[username] || {};

		this.userTriggeredEvents[username][eventType] =
			(this.userTriggeredEvents[username][eventType] || 0) + 1;

		this.recordEvent(eventType);
	}
	recordEvent(eventType: string) {
		this.events[eventType] = (this.events[eventType] || 0) + 1;
	}
}
