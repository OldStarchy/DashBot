/*
 * Depends on discord plugin
 */
import { MessageReaction, User } from 'discord.js';
import Identity from '../ChatServer/Identity';
import Interaction from '../ChatServer/Interaction';
import Message from '../ChatServer/Message';
import TextChannel from '../ChatServer/TextChannel';
import DashBot from '../DashBot';
import DashBotPlugin, { DashBotContext } from '../DashBotPlugin';
import { EventForEmitter } from '../Events';
import Tracery from '../tracery/Tracery';
import deferred, { Deferred } from '../util/deferred';
import Emoji from '../util/emoji';
import formatTable from '../util/formatTable';
import sleep from '../util/sleep';
import DiscordMessage from './Discord/ChatServer/DiscordMessage';

interface QuizGameState {
	playing: boolean;
	channel: TextChannel;
	players: Identity[];
	questionNumber: number;
	previousQuestions: string[];

	currentQuestion?: GameQuestion;
	currentDeferred?: Deferred<Message>;

	scores: Record<string, number>;
}

const grammar = {
	'correct-answer': ['Nice one #target.tag#, you got it right.'],
	'next-question': ['Ok, next question.'],
	'last-question': ['This is the last question.'],
};
export default class QuizGamePlugin extends DashBotPlugin {
	public readonly name = 'Quiz Game';

	register(context: DashBotContext) {
		new QuizGameService().register(context.bot);
	}
}

export class QuizGameService implements Interaction {
	private _games: Record<string, QuizGameState> = {};

	register(bot: DashBot) {
		bot.on('message', this.onMessage.bind(this));
	}

	private onMessage(event: EventForEmitter<DashBot, 'message'>) {
		const message = event.data;
		const channel = message.channel;

		if (channel.supportsReactions) {
			if (!this.isGamePlayingInChannel(channel)) {
				if (/(lets )?play (a )?quiz/.test(message.textContent)) {
					event.cancel();
					//Do not await this
					this.initGame(channel);
				}
			} else {
				const gameState = this._games[channel.id];
				if (gameState.currentQuestion) {
					if (
						gameState.currentQuestion.answer.test(
							message.textContent
						)
					) {
						gameState.currentDeferred?.resolve(message);
						event.cancel();
						return;
					}
				}
			}
		}
	}

	private async awaitAnswer(
		gameState: QuizGameState,
		question: GameQuestion
	) {
		const p = deferred<Message>();

		gameState.currentQuestion = question;
		gameState.currentDeferred = p;

		const message = await Promise.race([p, sleep(60000)]);

		gameState.currentQuestion = undefined;
		gameState.currentDeferred = undefined;

		return message;
	}
	private isGamePlayingInChannel(channel: TextChannel) {
		return this._games[channel.id]?.playing ?? false;
	}

	private async endGame(channel: TextChannel, message?: string) {
		if (this._games[channel.id]) {
			delete this._games[channel.id];
		}

		if (message) {
			await channel.sendText(message);
		}
	}

	private async initGame(channel: TextChannel) {
		const gameState: QuizGameState = {
			playing: true,
			channel,
			players: [],
			questionNumber: 0,
			previousQuestions: [],
			scores: {},
		};

		this._games[channel.id] = gameState;

		await channel.sendText('OK, Lets start a quiz.');

		const message = (await channel.sendText(
			`All players react to this message with ${Emoji.THUMBS_UP} to play. React with ${Emoji.OK} to begin the game`
		)) as void | DiscordMessage;

		if (!message) return;

		await message.react(Emoji.THUMBS_UP);
		await message.react(Emoji.NO_ENTRY);
		await message.react(Emoji.OK);

		const dm = message.discordMessage;

		// Wait up to 2 minutes for a thumbs up. Reminder after 1min expire after 2
		for (let i = 1; i >= 0; i--) {
			try {
				//Wait for an "OK"
				await dm.awaitReactions({
					filter: (reaction: MessageReaction) =>
						reaction.emoji.name
							? [Emoji.OK, Emoji.NO_ENTRY].includes(
									reaction.emoji.name
							  )
							: false,
					max: 2,
					time: 60000,
					errors: ['time'],
				});
				break;
			} catch {
				if (i > 0) {
					await channel.sendText(
						`Don\'t forget to ${Emoji.THUMBS_UP}!`
					);
				} else {
					return await this.endGame(channel, `Forget about it then.`);
				}
			}
		}

		//Check if cancelled with NO_ENTRY
		const noEntryReactionCount = (
			await dm.reactions.resolve(Emoji.NO_ENTRY)!.users.fetch()
		).reduce((a) => a++, 0);

		if (noEntryReactionCount > 1) {
			await this.endGame(channel, 'Ok no quiz for you');
			return;
		}

		//Find the people who played

		const players = (
			await dm.reactions.resolve(Emoji.THUMBS_UP)!.users.fetch()
		)
			.reduce((users, user) => {
				users.push(user);
				return users;
			}, [] as User[])
			.filter((user) => !user.bot);

		gameState.players = (
			await Promise.all(
				players.map(
					async (user) =>
						await channel.server.getIdentityById(user.id)
				)
			)
		).filter((id) => id !== null) as Identity[];

		if (gameState.players.length === 0) {
			return await this.endGame(channel, 'No players!');
		}

		await channel.sendText(
			`OK, ${gameState.players.map((p) => p.tag).join(', ')}. Lets play!`
		);

		gameState.players.forEach((p) => {
			gameState.scores[p.username] = 0;
		});

		this.playGame(gameState);
	}

	private async playGame(gameState: QuizGameState) {
		const totalQuestions = gameState.players.length * 3 + 1;

		await gameState.channel.sendText(
			'First person to reply correctly gets the point'
		);

		for (
			let questionNumber = 0;
			questionNumber < totalQuestions;
			questionNumber++
		) {
			const question = await this.generateQuestion(gameState);

			if (questionNumber > 0) {
				if (questionNumber === totalQuestions - 1) {
					await gameState.channel.sendText(
						Tracery.generate(grammar, 'last-question')
					);
				} else {
					await gameState.channel.sendText(
						Tracery.generate(grammar, 'next-question')
					);
				}
			}

			await sleep(1000);
			await gameState.channel.sendText(question.question);

			const answerMessage = await this.awaitAnswer(gameState, question);

			if (!answerMessage) {
				await gameState.channel.sendText(`TIME! ${Emoji.ALARM_CLOCK}`);

				await gameState.channel.sendText(
					`The answer was... "${question.answerNice}"`
				);
			} else {
				gameState.scores[answerMessage.author.username] =
					(gameState.scores[answerMessage.author.username] ?? 0) + 1;

				await gameState.channel.sendText(
					Tracery.generate(
						{
							...grammar,
							target: answerMessage.author,
						},
						'correct-answer'
					)
				);
			}
		}

		await gameState.channel.sendText("That's it folks!");

		await gameState.channel.sendText(
			formatTable([
				['Player', 'Score'],
				'=',
				...(
					Object.keys(gameState.scores).map((name) => [
						name,
						gameState.scores[name],
					]) as [string, number][]
				)
					.sort((a, b) => a[1] - b[1])
					.map(([name, score]) => [name, score.toFixed(0)]),
			])
		);

		this.endGame(gameState.channel);
	}

	private async generateQuestion(gameState: QuizGameState) {
		//Math questions for now
		let question: string, id: string, answerNice: string, answer: RegExp;
		do {
			const a = (Math.random() * 50) | 0;
			const b = (Math.random() * 50) | 0;

			question = `What is ${a} + ${b}?`;
			id = question;
			answerNice = (a + b).toFixed(0);
			answer = new RegExp('^' + answerNice + '$');
		} while (gameState.previousQuestions.includes(id));

		const q: GameQuestion = {
			id,
			question,
			answer,
			answerNice,
		};

		return q;
	}
}

interface Question {
	id: string;
	question: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface OpenQuestion extends Question {
	type: 'open';
	answerRegex: RegExp;
	answer: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MultipleChoiceQuestion extends Question {
	type: 'multiple-choice';
	options: [string, string, string, string];
	answer: 0 | 1 | 2 | 3;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface YesNoQuestion extends Question {
	type: 'yes-no';
	answer: boolean;
}

interface GameQuestion {
	question: string;
	answer: RegExp;
	answerNice: string;
	id: string;
}
