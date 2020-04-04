//@ts-check

import { Client as DiscordClient } from 'discord.js';
import express from 'express';
import { existsSync } from 'fs';
import Rcon from 'modern-rcon';
import { dirname, join, resolve } from 'path';
import winston from 'winston';
import HaikuCommand from './DashBot2/Commands/HaikuCommand';
import HelpCommand from './DashBot2/Commands/HelpCommand';
import ImgurCommand, { ImgurClient } from './DashBot2/Commands/ImgurCommand';
import JokeCommand, {
	ICanHazDadJokeClient,
} from './DashBot2/Commands/JokeCommand';
import PetCommand from './DashBot2/Commands/PetCommand';
import PollCommand from './DashBot2/Commands/PollCommand';
import StatisticsCommand from './DashBot2/Commands/StatisticsCommand';
import VersionCommand from './DashBot2/Commands/VersionCommand';
import DashBot from './DashBot2/DashBot';
import DiscordServer from './DashBot2/Discord/DiscordServer';
import IdentityService from './DashBot2/IdentityService';
import ABResponseInteraction from './DashBot2/Interactions/ABResponseInteraction';
import DieInteraction from './DashBot2/Interactions/DieInteraction';
import GreetInteraction from './DashBot2/Interactions/GreetInteraction';
import MinecraftGreetInteraction from './DashBot2/Interactions/MinecraftGreetInteraction';
import NumberGameInteraction from './DashBot2/Interactions/NumberGameInteraction';
import MinecraftServer from './DashBot2/Minecraft/MinecraftServer';
import MinecraftRelayService from './DashBot2/Services/MinecraftRelayService';
import UptimeTrackerStatistic from './DashBot2/Statistics/UptimeTrackerStatistic';
import getVersion from './getVersion';
import loadConfig from './loadConfig';
import MinecraftLogClient from './MinecraftLogClient/MinecraftLogClient';
import MinecraftPumpLogClient from './MinecraftLogClient/MinecraftPumpLogClient';
import MinecraftTailLogClient from './MinecraftLogClient/MinecraftTailLogClient';
import StatisticsTracker from './StatisticsTracker';
import Storage from './Storage';
import StorageRegister from './StorageRegister';
import formatTime from './util/formatTime';

const args = process.argv.slice(2);

if ((args.length == 1 && args[0] === '-v') || args[0] === '--version') {
	// eslint-disable-next-line no-console
	console.log(`DashBot ${getVersion()}`);
	process.exit(0);
}

const storageDir = resolve(
	((): string => {
		if (args.length === 0) {
			return 'storage';
		}

		if (args.length === 2 && args[0] === '--storage') {
			return args[1];
		}

		throw new Error(
			'Invalid arguments supplied. Either 0 or 2 arguments expected. Should be node main.js --storage path/to/storage/dir'
		);
	})()
);

// eslint-disable-next-line no-console
console.log(`Storage location set to ${storageDir}`);

if (!existsSync(storageDir)) {
	throw new Error(
		`Can\'t find storage directory at "${storageDir}", make sure it exists`
	);
}

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.printf(
		({ service, level, message }) =>
			`${formatTime(new Date())} [${service}] ${level}: ${message}`
	),
	defaultMeta: { service: 'dashbot' },
	transports: [
		new winston.transports.Console({ format: winston.format.simple() }),
		new winston.transports.File({
			filename: join(storageDir, 'dashbot.log'),
		}),
	],
});

logger.info('logger test');

process.on('uncaughtException', e => {
	logger.error(e.message);
	process.exit(1);
});

const config = loadConfig(storageDir);

Storage.rootDir = storageDir;

let minecraftClient: MinecraftLogClient | null = null;
let rcon: Rcon | null = null;

if (config.minecraft) {
	if (config.minecraft.logClient) {
		switch (config.minecraft.logClient.type) {
			case 'webhook':
				if (config.tls) {
					minecraftClient = new MinecraftPumpLogClient({
						express,
						greenlockConfig: {
							maintainerEmail: config.tls.maintainerEmail,
							packageAgent: config.tls.packageAgent,
							configDir: storageDir,
							packageRoot: dirname(__dirname),
							cluster: false,
							package: {
								name: 'dashbot',
								version: '1.0.0',
							},
						},
						whitelist: config.minecraft.logClient.whitelist,
						logger,
					});
				} else {
					if (config.minecraft.logClient.allowInsecure) {
						minecraftClient = new MinecraftPumpLogClient({
							express,
							logger,
							whitelist: config.minecraft.logClient.whitelist,
						});
					} else {
						throw new Error(
							"config.minecraft.logClient.type is 'webhook' but config.minecraft.logClient.allowInsecure is false and config.tls is not set"
						);
					}
				}
				break;

			case 'tail':
				minecraftClient = new MinecraftTailLogClient({
					logFilePath: config.minecraft.logClient.logFilePath,
					logger,
				});
				break;
		}
	}

	if (config.minecraft.rcon) {
		rcon = new Rcon(
			config.minecraft.rcon.host,
			config.minecraft.rcon.port,
			config.minecraft.rcon.password
		);
	}
}

const bot = new DashBot(logger);
const storage = new StorageRegister('storage.json', logger);
const identityService = new IdentityService(storage);
const statistics = new StatisticsTracker();
const discordClient = new DiscordClient();
storage.watch();

if (minecraftClient) {
	const mcServer = new MinecraftServer(
		minecraftClient,
		rcon || null,
		new StorageRegister('storage2.json', logger),
		identityService
	);
	bot.addServer(mcServer);
	identityService.addProvider(mcServer);
}

const dcServer = new DiscordServer(
	discordClient,
	{ botToken: config.discordBotToken },
	identityService
);
bot.addServer(dcServer);
identityService.addProvider(dcServer);

statistics.register(new UptimeTrackerStatistic(bot));
statistics.register({
	getStatistics: async () => {
		return [
			{
				name: 'Version',
				statistic: getVersion(),
			},
		];
	},
});
const helpCommand = new HelpCommand(storage);
bot.registerCommand('stats', new StatisticsCommand(statistics));
bot.registerCommand('joke', new JokeCommand(new ICanHazDadJokeClient()));
bot.registerCommand('haiku', new HaikuCommand());
bot.registerCommand('poll', new PollCommand());
const petCommand = new PetCommand(storage);
bot.registerCommand('pet', petCommand);
bot.registerCommand('help', helpCommand);
bot.registerCommand('version', new VersionCommand());
statistics.register(petCommand);
const minecraftRelayService = new MinecraftRelayService(
	identityService,
	storage
);
minecraftRelayService.register(bot);
bot.registerCommand('minecraft', minecraftRelayService.getEnableCommand());

if (config.imgurClientId) {
	bot.registerCommand(
		'imgur',
		new ImgurCommand(new ImgurClient(config.imgurClientId))
	);
}

new NumberGameInteraction(storage).register(bot);
new GreetInteraction().register(bot);
new DieInteraction().register(bot);
helpCommand.register(bot);
new MinecraftGreetInteraction().register(bot);
new ABResponseInteraction([
	[
		/^compliment( please)?/i,
		[
			'#target.username#, you have beautiful eyes.',
			'#target.username#, your face reminds me of someone who has a beautiful face.',
			"Music is better when I listen to it with #target.username#! Oh wait, this isn't plug.dj! :open_mouth:",
			"I don't care about trying to be more human-like, but if I could be more like #target.username# I would be happy.",
			"If I had eyes, they'd be looking at you #target.username#!",
			'You have an exquisite aura',
			"My friends won't believe me when I go home tonight and tell them I met #target.username# today!",
		],
	],
	[
		/^insult( please)?/i,

		[
			"I couldn't possibly insult someone as kind as you #target.username#.",
			"There's nothing bad to say about you.",
			'Why do you want me to do that?',
			'A positive attitude starts with positive behaviour, insults are counter productive',
			"Oh, um, I don't like your.. stunning good looks?",
		],
	],
	[
		/^(여보세요|안녕하세요)/i,
		'나는 한국어를 못하지만 내 친구 인 #target.username#는합니다.',
	],
	[
		/^(こんいちは|今日は|おはよう|こんばんは)/i,
		'おはよう。。。かそれがこんばんわですか?何時かわからない :man_shrugging:',
	],
	[/^(만나서 반가워요)/i, ['만나서 반가워요 #target.username#']],
	[
		/^link(age)? (pls|please)$/i,
		[
			'http://i.imgur.com/03t8FfH.gif',
			'http://i.imgur.com/oeCQSZa.gif',
			'http://24.media.tumblr.com/tumblr_mdcyicRSCh1r84nrbo2_400.gif',
			'http://fc09.deviantart.net/fs70/f/2012/019/6/6/dance_link__daaance__by_nasakii-d4mzerp.gif',
			'http://fc06.deviantart.net/fs71/f/2012/063/4/e/links_dubstep_dance_by_13alicia-d4rq2jm.gif',
			'http://fc06.deviantart.net/fs44/f/2009/117/9/0/Dance_chibi_Link_dance_xD_by_sparxpunx.gif',
			'http://i859.photobucket.com/albums/ab159/gothictsukasa/Legend-of-zelda-link-navi.gif',
			'http://images6.fanpop.com/image/photos/32500000/Link-the-legend-of-zelda-32575476-500-500.gif',
		],
	],
	[
		/^sassy (ro)?bot$/i,
		[
			'https://thenypost.files.wordpress.com/2017/08/170804-sassy-communists-chatbots-feature.jpg?quality=90&strip=all&w=618&h=410&crop=1',
			'https://upload.wikimedia.org/wikipedia/en/thumb/2/29/Alan_Tudyk_as_K-2SO-Rogue_One_%282016%29.jpg/220px-Alan_Tudyk_as_K-2SO-Rogue_One_%282016%29.jpg',
		],
	],
	[
		/^pon(y|ies) (pictures? )?(pls|please)$/i,
		[
			'http://media.giphy.com/media/mRqTOQkwmO9xe/giphy.gif',
			'http://i284.photobucket.com/albums/ll40/JazzEx022/111009-animatedapple_bloomdeadpoolscootaloosilver_spoonSpider-ManspidermanSweetie_BelleTwist.gif',
			'http://media.giphy.com/media/oDq2jEKDLJ8E8/giphy.gif',
			'http://media1.giphy.com/media/I1hC7mQZpW4jS/giphy.gif',
			'http://31.media.tumblr.com/8dd4c7fe07aead115ea3e6171708d1ca/tumblr_modktorBMz1rthxy9o1_500.gif',
			'http://img4.wikia.nocookie.net/__cb20140309190904/mlp/images/d/dc/AppleHappyJumping.gif',
			//dancing
			'http://4.bp.blogspot.com/-7Rj2RNCajsE/UK6T9HBBU9I/AAAAAAABDmw/cDHRKhiOClI/s1600/32271__safe_animated_dinky-hooves_dance.gif',
			'http://img3.wikia.nocookie.net/__cb20110314152016/mlpfanart/images/c/c2/Pinkie_Pie_dancing_to_her_Zecora_song.gif',
			'http://img1.wikia.nocookie.net/__cb20110503154149/mlp/images/4/43/Gummy_dancing_S1E25.gif',
			'http://img2.wikia.nocookie.net/__cb20140415224206/mipequeoponyfanlabor/es/images/9/9a/Pony_dance_gif_by_gibsonflyingv-d4ia62q.gif',
			'http://fc07.deviantart.net/fs71/f/2013/113/5/8/my_little_pony___pesonajes_gifs_by_happysadlife-d62q7pj.gif',
			'http://img4.wikia.nocookie.net/__cb20130102165457/mlpfanart/images/e/e7/Luna_clapping.gif',
		],
	],
	[
		/^who is best pony\??$/i,
		[
			'Rainbow Dash, obviously, though it is close.',
			'Pinkie Pie dictates that I answer Pinkie Pie',
			'Who do you think? Its obviously Discord lol',
			'\\#TeamTrees',
		],
	],
	['meaning of life', '42'],
	['give cookie', ':cookie:'],
	['give 2 cookies', "no, don't be greedy"],
	['speed of an african swallow', 'I have no idea, sorry.'],
	['rock paper scissors', "um.. I don't have hands"],
	['pi', '22/7'],
]).register(bot);

bot.connect();

const signals: Record<'SIGHUP' | 'SIGINT' | 'SIGTERM', number> = {
	SIGHUP: 1,
	SIGINT: 2,
	SIGTERM: 15,
};

const shutdown = async (signal: string, value: number) => {
	logger.info(`Shutting down due to ${signal}`);
	await bot.disconnect();

	logger.info(`server stopped by ${signal} with value ${value}`);
	process.exit(128 + value);
};

(Object.keys(signals) as ('SIGHUP' | 'SIGINT' | 'SIGTERM')[]).forEach(
	signal => {
		process.on(signal, () => {
			shutdown(signal, signals[signal]);
		});
	}
);
