import IdentityService from '../ChatServer/IdentityService';
import Message from '../ChatServer/Message';
import Command from '../Command';
import DashBot from '../DashBot';
import { Event, EventEmitter } from '../Events';
import Service from '../Service';
import StorageRegister, { DataStore } from '../StorageRegister';
import DateStringParser from '../util/DateStringParser';
import { PartialDefaults } from '../util/PartialDefaults';
import shallowMerge from '../util/shallowMerge';

interface Options {
	/**
	 * Delay between checking for events in milliseconds
	 */
	interval: number;
	storage: StorageRegister;
	identityService: IdentityService;
	maxTimersPerPerson: number;
}
const defaultOptions = {
	interval: 5000,
	maxTimersPerPerson: 5,
};

export type ScheduleServiceOptions = PartialDefaults<
	Options,
	typeof defaultOptions
>;

interface ScheduleServiceData {
	events: { timestamp: number; event: Event<unknown>; owner: string }[];
}
export default class ScheduleService extends EventEmitter implements Service {
	private _interval: number;
	private _intervalId: NodeJS.Timeout | null = null;
	private _store: DataStore<ScheduleServiceData>;
	private _identityService: IdentityService;
	private _maxTimersPerPerson: number;

	private _remindCommand: Command;

	constructor(options: ScheduleServiceOptions) {
		super();
		const compiledOptions = shallowMerge(defaultOptions, options);

		const {
			interval,
			storage,
			identityService,
			maxTimersPerPerson,
		} = compiledOptions;

		this._interval = interval;
		this._identityService = identityService;
		this._maxTimersPerPerson = maxTimersPerPerson;

		this._store = storage.createStore<ScheduleServiceData>(
			'ScheduleService',
			false
		);

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const service = this;

		this._remindCommand = new (class RemindCommand implements Command {
			async run(
				message: Message | null,
				name: string,
				...args: string[]
			) {
				if (message === null || !message.channel.canSend) return;

				if (args.length === 0) {
					await message.channel.sendText('No args');
					return;
				}

				let time: number | null = null;
				let reminder = '';
				const { time: t, remainingStr } = DateStringParser.tryParse(
					args.join(' '),
					Date.now(),
					// +9:30 for adelaide time
					9 * 60 * 60 * 1000 + 30 * 60 * 1000
				);
				time = t;
				reminder = remainingStr;

				if (time === null) {
					await message.channel.sendText("Couldn't parse time");
					return;
				}

				if (reminder === '') {
					await message.channel.sendText('Missing reminder');
					return;
				}

				const success = service.queueEvent(
					time,
					new Event('reminder', {
						reminder,
						serverId: message.channel.server.id,
						channelId: message.channel.id,
					}),
					message.author.id
				);

				if (success) {
					//TODO: get timezone for person, or fallback to channel/server default
					await message.channel.sendText(
						`"${reminder}" at ${new Date(time).toLocaleString(
							'en-AU',
							{
								timeZone: 'Australia/Adelaide',
							}
						)} (${DateStringParser.getTimeDiffString(
							time - Date.now()
						)})`
					);
				} else {
					await message.channel.sendText(
						`Could not set a reminder, you probably have 5 set already`
					);
				}
			}
		})();
	}
	register(dashBot: DashBot) {
		dashBot.registerCommand('remind', this._remindCommand);
		this.start();

		this.on('reminder', async e => {
			const { reminder, serverId, channelId } = e.data;
			const channel = await this._identityService
				.getServer(serverId)
				?.getTextChannel(channelId);
			if (channel) {
				channel.sendText(`Reminder: ${reminder}`);
			}
		});
	}

	checkForEvents() {
		const events = this._store.getData()?.events || [];

		const now = Date.now();

		let any = false;

		while (events.length > 0 && events[0].timestamp < now) {
			const event = events.shift()!;
			any = true;
			try {
				this.emit(event.event);
				//TODO: try/catch log
			} catch {}
		}

		if (any) this._store.setData({ events });
	}

	queueEvent<T>(timestamp: number, event: Event<T>, owner: string) {
		const events = this._store.getData()?.events || [];

		if (this._maxTimersPerPerson > 0) {
			const existing = events.filter(e => e.owner === owner).length;
			if (existing > this._maxTimersPerPerson) {
				return false;
			}
		}
		const index = events.findIndex(e => e.timestamp > timestamp);
		if (index === -1) events.push({ timestamp, event, owner });
		else {
			events.splice(index, 0, { timestamp, event, owner });
		}

		this._store.setData({ events });
		return true;
	}

	start() {
		if (this._intervalId !== null) return;

		this._intervalId = setInterval(
			() => this.checkForEvents(),
			this._interval
		);
	}

	stop() {
		if (this._intervalId === null) return;

		clearInterval(this._intervalId);
		this._intervalId = null;
	}
}
