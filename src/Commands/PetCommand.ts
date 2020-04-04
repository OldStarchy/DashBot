import Message from '../ChatServer/Message';
import Command from '../Command';
import { Event } from '../Events';
import { Statistic, StatisticProvider } from '../StatisticsTracker';
import StorageRegister, { PersistentData } from '../StorageRegister';

function getDayString(date: Date) {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

interface PetActionStorage {
	timesPet: number;
	timesPetToday: number;
	timesPetTodayDate: string;
	mostPetsPerDay: number;
	petsPerPerson: Record<string, number>;
}

export default class PetCommand implements Command, StatisticProvider {
	private _timesPet = 0;
	private _timesPetToday = 0;
	private _timesPetTodayDate = getDayString(new Date());
	private _mostPetsPerDay = 0;
	private _petsPerPerson: Record<string, number> = {};
	private _store: PersistentData<PetActionStorage>;

	constructor(storage: StorageRegister) {
		this._store = storage.createStore('PetAction');
		this._store.on('dataLoaded', this.onReadData.bind(this));
	}

	async getStatistics() {
		this.rolloverDateCount();

		const statistics: Statistic[] = [
			{
				name: 'Times pet Total',
				statistic: this._timesPet,
			},
		];

		if (this._mostPetsPerDay === this._timesPetToday) {
			statistics.push({
				name: 'Times pet Today (new record)',
				statistic: this._timesPetToday,
			});
		} else {
			statistics.push(
				{
					name: 'Times pet Today',
					statistic: this._timesPetToday,
				},
				{
					name: 'Most pets in a single day',
					statistic: this._mostPetsPerDay,
				}
			);
		}

		let top: { name: string; count: number } | null = null;

		for (const name of Object.keys(this._petsPerPerson)) {
			if (top === null || this._petsPerPerson[name] > top.count)
				top = { name, count: this._petsPerPerson[name] };
			else if (this._petsPerPerson[name] === top.count)
				top = { name: `${top.name}, ${name}`, count: top.count };
		}

		if (top !== null) {
			statistics.push({
				name: 'Best person',
				statistic: top.name,
			});
		}

		return statistics;
	}

	public onReadData(event: Event<PetActionStorage | undefined>) {
		const data = event.data;

		if (data) {
			if (typeof data.timesPet === 'number') {
				this._timesPet = data.timesPet;
			}
			if (typeof data.timesPetToday === 'number') {
				this._timesPetToday = data.timesPetToday;
			}
			if (typeof data.timesPetTodayDate === 'string') {
				this._timesPetTodayDate = data.timesPetTodayDate;
			}
			if (typeof data.mostPetsPerDay === 'number') {
				this._mostPetsPerDay = data.mostPetsPerDay;
			}
			if (typeof data.petsPerPerson === 'object') {
				for (const name of Object.keys(data.petsPerPerson)) {
					if (typeof data.petsPerPerson[name] === 'number') {
						this._petsPerPerson[name] = data.petsPerPerson[name];
					}
				}
			}
		}
	}

	public writeData() {
		this._store.setData({
			timesPet: this._timesPet,
			timesPetToday: this._timesPetToday,
			timesPetTodayDate: this._timesPetTodayDate,
			mostPetsPerDay: this._mostPetsPerDay,
			petsPerPerson: this._petsPerPerson,
		});
	}

	private rolloverDateCount() {
		const today = getDayString(new Date());
		if (today !== this._timesPetTodayDate) {
			this._timesPetToday = 0;
			this._timesPetTodayDate = today;
		}
	}

	private pet(petterName: string) {
		this.rolloverDateCount();

		this._timesPet++;
		this._timesPetToday++;

		if (this._timesPetToday > this._mostPetsPerDay) {
			this._mostPetsPerDay = this._timesPetToday;
		}

		if (petterName)
			this._petsPerPerson[petterName] =
				(this._petsPerPerson[petterName] || 0) + 1;

		this.writeData();
	}

	async run(message: Message) {
		if (message === null) {
			return;
		}

		const channel = message.channel;

		this.pet(message.author.username);

		if (channel.supportsReactions) message.react('❤️');

		switch (this._timesPetToday) {
			case 1: {
				channel.sendText('First pet of the day!');
				break;
			}
			case 2: {
				channel.sendText('Second pet of the day!');
				break;
			}
			case 4: {
				channel.sendText('Fourth pet of the day!');
				break;
			}
			case 8: {
				channel.sendText('Eighth pet of the day!');
				break;
			}
			case 16: {
				channel.sendText('Sixteenth pet of the day!');
				break;
			}
			case 32: {
				channel.sendText('Thirty Second pet of the day!');
				break;
			}
			case 64: {
				channel.sendText('Sixty Fourth pet of the day!');
				break;
			}
			case 128: {
				channel.sendText(
					'One Hundred and Twenty Eighth pet of the day!'
				);
				break;
			}
			case 256: {
				channel.sendText('Two Hundred and Fifty Sixth pet of the day!');
				break;
			}
			case 512: {
				channel.sendText('Five Hundred and Twelfth pet of the day!');
				break;
			}
			case 1024: {
				channel.sendText(
					'One Thousand and Twenty Fourth pet of the day!'
				);
				break;
			}
		}
	}
}
