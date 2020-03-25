import { Message } from 'discord.js';
import { Action } from '../Action';
import DashBot from '../DashBot';
import StatisticsTracker, {
	Statistic,
	StatisticProvider,
} from '../StatisticsTracker';
import StorageRegister, { PersistentData } from '../StorageRegister';

function getDayString(date: Date) {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

interface Person {
	id: string;
	type: 'discord' | 'minecraft';
	name?: string;
}

interface PetActionStorage {
	timesPet: number;
	timesPetToday: number;
	timesPetTodayDate: string;
	mostPetsPerDay: number;
	petsPerPerson: Record<string, number>;
}

export default class PetAction extends Action implements StatisticProvider {
	private timesPet = 0;
	private timesPetToday = 0;
	private timesPetTodayDate = getDayString(new Date());
	private mostPetsPerDay = 0;
	private petsPerPerson: Record<string, number> = {};
	private store: PersistentData<PetActionStorage>;

	constructor(
		bot: DashBot,
		stats: StatisticsTracker,
		storage: StorageRegister
	) {
		super(bot);
		stats.register(this);
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

	public onReadData(data: PetActionStorage | undefined) {
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

	private pet(petter: Person) {
		this.rolloverDateCount();

		this.timesPet++;
		this.timesPetToday++;

		if (this.timesPetToday > this.mostPetsPerDay) {
			this.mostPetsPerDay = this.timesPetToday;
		}

		if (petter.name)
			this.petsPerPerson[petter.name] =
				(this.petsPerPerson[petter.name] || 0) + 1;

		this.writeData();
	}

	async handle(message: Message) {
		if (message.content === '!pet') {
			this.pet({
				id: message.author.id,
				name: message.author.username,
				type: 'discord',
			});

			message.react('❤️');

			switch (this.timesPetToday) {
				case 1: {
					message.reply('First pet of the day!');
					break;
				}
				case 2: {
					message.reply('Second pet of the day!');
					break;
				}
				case 4: {
					message.reply('Fourth pet of the day!');
					break;
				}
				case 8: {
					message.reply('Eighth pet of the day!');
					break;
				}
				case 16: {
					message.reply('Sixteenth pet of the day!');
					break;
				}
				case 32: {
					message.reply('Thirty Second pet of the day!');
					break;
				}
				case 64: {
					message.reply('Sixty Fourth pet of the day!');
					break;
				}
				case 128: {
					message.reply(
						'One Hundred and Twenty Eighth pet of the day!'
					);
					break;
				}
				case 256: {
					message.reply(
						'Two Hundred and Fifty Sixth pet of the day!'
					);
					break;
				}
				case 512: {
					message.reply('Five Hundred and Twelfth pet of the day!');
					break;
				}
				case 1024: {
					message.reply(
						'One Thousand and Twenty Fourth pet of the day!'
					);
					break;
				}
			}
			return true;
		}
		return false;
	}
}
