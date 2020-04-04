import { Statistic, StatisticProvider } from '../../StatisticsTracker';
import StorageRegister, { PersistentData } from '../../StorageRegister';
import Command from '../Command';
import { Event } from '../Events';
import Message from '../Message';

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
	private timesPet = 0;
	private timesPetToday = 0;
	private timesPetTodayDate = getDayString(new Date());
	private mostPetsPerDay = 0;
	private petsPerPerson: Record<string, number> = {};
	private store: PersistentData<PetActionStorage>;

	constructor(storage: StorageRegister) {
		this.store = storage.createStore('PetAction');
		this.store.on('dataLoaded', this.onReadData.bind(this));
	}

	async getStatistics() {
		this.rolloverDateCount();

		const statistics: Statistic[] = [
			{
				name: 'Times pet Total',
				statistic: this.timesPet,
			},
		];

		if (this.mostPetsPerDay === this.timesPetToday) {
			statistics.push({
				name: 'Times pet Today (new record)',
				statistic: this.timesPetToday,
			});
		} else {
			statistics.push(
				{
					name: 'Times pet Today',
					statistic: this.timesPetToday,
				},
				{
					name: 'Most pets in a single day',
					statistic: this.mostPetsPerDay,
				}
			);
		}

		let top: { name: string; count: number } | null = null;

		for (const name of Object.keys(this.petsPerPerson)) {
			if (top === null || this.petsPerPerson[name] > top.count)
				top = { name, count: this.petsPerPerson[name] };
			else if (this.petsPerPerson[name] === top.count)
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
				this.timesPet = data.timesPet;
			}
			if (typeof data.timesPetToday === 'number') {
				this.timesPetToday = data.timesPetToday;
			}
			if (typeof data.timesPetTodayDate === 'string') {
				this.timesPetTodayDate = data.timesPetTodayDate;
			}
			if (typeof data.mostPetsPerDay === 'string') {
				this.mostPetsPerDay = data.mostPetsPerDay;
			}
			if (typeof data.petsPerPerson === 'object') {
				for (const name of Object.keys(data.petsPerPerson)) {
					if (typeof data.petsPerPerson[name] === 'number') {
						this.petsPerPerson[name] = data.petsPerPerson[name];
					}
				}
			}
		}
	}

	public writeData() {
		this.store.setData({
			timesPet: this.timesPet,
			timesPetToday: this.timesPetToday,
			timesPetTodayDate: this.timesPetTodayDate,
			mostPetsPerDay: this.mostPetsPerDay,
			petsPerPerson: this.petsPerPerson,
		});
	}

	private rolloverDateCount() {
		const today = getDayString(new Date());
		if (today !== this.timesPetTodayDate) {
			this.timesPetToday = 0;
			this.timesPetTodayDate = today;
		}
	}

	private pet(petterName: string) {
		this.rolloverDateCount();

		this.timesPet++;
		this.timesPetToday++;

		if (this.timesPetToday > this.mostPetsPerDay) {
			this.mostPetsPerDay = this.timesPetToday;
		}

		if (petterName)
			this.petsPerPerson[petterName] =
				(this.petsPerPerson[petterName] || 0) + 1;

		this.writeData();
	}

	async run(message: Message) {
		if (message === null) {
			return;
		}

		const channel = message.getChannel();

		this.pet(message.getAuthor().getName());

		if (channel.getSupportsReactions()) message.react('❤️');

		switch (this.timesPetToday) {
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
