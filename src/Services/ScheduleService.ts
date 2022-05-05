import { DateTime } from 'luxon';
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

interface ReminderData {
	reminder: string;
	serverId: string;
	channelId: string;
}
interface ScheduleServiceEvents {
	reminder: ReminderData;
	[eventName: string]: unknown;
}

interface ScheduleServiceData {
	events: {
		timestamp: number;
		event: Event<string, unknown>;
		owner: string;
	}[];
}

export default class ScheduleService
	extends EventEmitter<ScheduleServiceEvents>
	implements Service
{
	private _interval: number;
	private _intervalId: NodeJS.Timeout | null = null;
	private _store: DataStore<ScheduleServiceData>;
	private _identityService: IdentityService;
	private _maxTimersPerPerson: number;

	private _listRemindersCommand: Command;
	private _deleteReminderCommand: Command;
	private _remindCommand: Command;

	constructor(options: ScheduleServiceOptions) {
		super();
		const compiledOptions = shallowMerge(defaultOptions, options);

		const { interval, storage, identityService, maxTimersPerPerson } =
			compiledOptions;

		this._interval = interval;
		this._identityService = identityService;
		this._maxTimersPerPerson = maxTimersPerPerson;

		this._store = storage.createStore<ScheduleServiceData>(
			'ScheduleService',
			false
		);

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const service = this;

		this._listRemindersCommand =
			new (class ListRemindersCommand extends Command {
				name = 'listreminders';
				description = 'Lists all the reminders in the current room';

				async run(message: Message): Promise<void> {
					const channel = message.channel;
					const server = channel.server;

					const events = service
						.getEventsForChannel(server.id, channel.id)
						.filter((event) =>
							service.isReminderEvent(event.event)
						) as {
						timestamp: number;
						event: Event<string, ReminderData>;
						owner: string;
					}[];

					if (events.length === 0) {
						channel.sendText('No reminders for this channel.');
						return;
					}

					let id = 1;
					for (const event of events) {
						await channel.sendText(
							`${id++}: ${service.formatTimestamp(
								event.timestamp
							)}: ${event.event.data.reminder}`
						);
					}
				}
			})();

		this._deleteReminderCommand =
			new (class ListRemindersCommand extends Command {
				name = 'deletereminder';
				description = 'Lists all the reminders in the current room';

				async run(message: Message, indexArg: string): Promise<void> {
					const channel = message.channel;
					const server = channel.server;

					const events = service
						.getEventsForChannel(server.id, channel.id)
						.filter((event) =>
							service.isReminderEvent(event.event)
						) as {
						timestamp: number;
						event: Event<string, ReminderData>;
						owner: string;
					}[];

					if (events.length === 0) {
						channel.sendText('No reminders for this channel.');
						return;
					}

					const index = parseInt(indexArg) - 1;

					if (index >= events.length || index < 0) {
						channel.sendText('You are invalid!');
						return;
					}

					service.deleteReminder(server.id, channel.id, index);
					channel.sendText(`oke`);
				}
			})();

		this._remindCommand = new (class RemindCommand extends Command {
			readonly name = 'remind';
			readonly description =
				"Sets a one-off reminder.\n!remind <date / time> <message>\nYou can have up to 5 reminders at a time. Once you set one, you can't change it so set them wisely";

			async run(message: Message, ...args: string[]) {
				if (!message.channel.canSend) return;

				if (args.length === 0) {
					await message.channel.sendText('No args');
					return;
				}

				let time: number | null = null;
				let reminder = '';
				const { time: t, remainingStr } = DateStringParser.tryParse(
					args.join(' '),
					undefined,
					'Australia/Adelaide'
				);
				time = t;
				reminder = remainingStr;

				if (null === time) {
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
						`"${reminder}" ${service.formatTimestamp(time)})`
					);
				} else {
					await message.channel.sendText(
						`Could not set a reminder, you probably have 5 set already`
					);
				}
			}
		})();
	}

	formatTimestamp(time: number) {
		const timeDiff = time - Date.now();
		const lessThanADay = Math.abs(timeDiff) < 1000 * 60 * 60 * 24;
		const format = lessThanADay ? `'at' t` : `'on' DDDD 'at' t`;

		return `${DateTime.fromMillis(time, {
			locale: 'utc',
		})
			.setZone('Australia/Adelaide')
			.toFormat(format)} (${DateStringParser.getTimeDiffString(
			timeDiff
		)})`;
	}
	register(dashBot: DashBot) {
		dashBot.commands.add(this._remindCommand);
		dashBot.commands.add(this._listRemindersCommand);
		dashBot.commands.add(this._deleteReminderCommand);

		this.start();

		this.on('reminder', async (e) => {
			const { reminder, serverId, channelId } = e.data;
			const channel = await this._identityService
				.getServer(serverId)
				?.getTextChannel(channelId);
			if (channel) {
				channel.sendText(`Reminder: ${reminder}`);
			}
		});
	}

	getEvents() {
		return this._store.getData()?.events || [];
	}

	getEventsForChannel(serverId: string, channelId: string) {
		const events = this.getEvents();

		return events.filter((event) => {
			if (this.isReminderEvent(event.event)) {
				if (
					event.event.data.serverId == serverId &&
					event.event.data.channelId == channelId
				)
					return true;
			}
			return false;
		});
	}

	isReminderEvent(
		event: Event<string, unknown>
	): event is Event<string, ReminderData> {
		if (event.data instanceof Object) {
			if (
				'reminder' in event.data &&
				'serverId' in event.data &&
				'channelId' in event.data
			)
				return true;
		}
		return false;
	}

	checkForEvents() {
		const events = this.getEvents();

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

	queueEvent(
		timestamp: number,
		event: Event<string, unknown>,
		owner: string
	) {
		const events = this._store.getData()?.events || [];

		if (this._maxTimersPerPerson > 0) {
			const existing = events.filter((e) => e.owner === owner).length;
			if (existing > this._maxTimersPerPerson) {
				return false;
			}
		}
		const index = events.findIndex((e) => e.timestamp > timestamp);
		if (index === -1) events.push({ timestamp, event, owner });
		else {
			events.splice(index, 0, { timestamp, event, owner });
		}

		this._store.setData({ events });
		return true;
	}

	deleteReminder(serverId: string, channelId: string, index: number) {
		const events = this.getEvents();

		let i = 0;
		let id2 = 0;
		for (const event of events) {
			if (
				this.isReminderEvent(event.event) &&
				event.event.data.channelId === channelId &&
				event.event.data.serverId === serverId
			) {
				if (i === index) {
					events.splice(id2, 1);
					break;
				}
				i++;
			}

			id2++;
		}
		this._store.setData({
			events,
		});
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
