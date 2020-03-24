import { Message } from 'discord.js';
import { Action } from '../Action';
import DashBot from '../DashBot';
import StatisticsTracker, { StatisticProvider } from '../StatisticsTracker';
import StorageRegister, { PersistentData } from '../StorageRegister';

function getDayString(date: Date) {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

interface PetActionStorage {
	timesPet: number;
	timesPetToday: number;
	timesPetTodayDate: string;
}

export default class PetAction extends Action implements StatisticProvider {
	private timesPet = 0;
	private timesPetToday = 0;
	private timesPetTodayDate = getDayString(new Date());
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
		return [
			{
				name: 'Times pet Today',
				statistic: this.timesPetToday,
			},
			{
				name: 'Times pet Total',
				statistic: this.timesPet,
			},
		];
	}

	public onReadData(data: PetActionStorage) {
		if (typeof data.timesPet === 'number') {
			this.timesPet = data.timesPet;
		}
		if (typeof data.timesPetToday === 'number') {
			this.timesPetToday = data.timesPetToday;
		}
		if (typeof data.timesPetTodayDate === 'string') {
			this.timesPetTodayDate = data.timesPetTodayDate;
		}
	}

	public writeData() {
		this.store.setData({
			timesPet: this.timesPet,
			timesPetToday: this.timesPetToday,
			timesPetTodayDate: this.timesPetTodayDate,
		});
	}

	private rolloverDateCount() {
		const today = getDayString(new Date());
		if (today !== this.timesPetTodayDate) {
			this.timesPetToday = 0;
			this.timesPetTodayDate = today;
		}
	}

	private pet() {
		this.rolloverDateCount();

		this.timesPet++;
		this.timesPetToday++;

		this.writeData();
	}

	async handle(message: Message) {
		if (message.content === '!pet') {
			this.pet();

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
