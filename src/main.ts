//@ts-check

import { Client as DiscordClient } from 'discord.js';
import express from 'express';
import { existsSync } from 'fs';
import Rcon from 'modern-rcon';
import { dirname, join, resolve } from 'path';
import winston from 'winston';
import { DashBotOptions } from './DashBot';
import HaikuCommand from './DashBot2/Commands/HaikuCommand';
import { HelpCommand } from './DashBot2/Commands/HelpCommand';
import ImgurCommand, { ImgurClient } from './DashBot2/Commands/ImgurCommand';
import JokeCommand, {
	ICanHazDadJokeClient,
} from './DashBot2/Commands/JokeCommand';
import PetCommand from './DashBot2/Commands/PetCommand';
import PollCommand from './DashBot2/Commands/PollCommand';
import StatisticsCommand from './DashBot2/Commands/StatisticsCommand';
import { DashBot2 } from './DashBot2/DashBot2';
import DiscordServer from './DashBot2/Discord/DiscordServer';
import IdentityService from './DashBot2/IdentityService';
import { DieInteraction } from './DashBot2/Interactions/DieInteraction';
import { GreetInteraction } from './DashBot2/Interactions/GreetInteraction';
import { NumberGameInteraction } from './DashBot2/Interactions/NumberGameInteraction';
import MinecraftServer from './DashBot2/Minecraft/MinecraftServer';
import UptimeTrackerStatistic from './DashBot2/Statistics/UptimeTrackerStatistic';
import { getVersion } from './getVersion';
import loadConfig from './loadConfig';
import { MinecraftPumpLogClient } from './MinecraftLogClient/MinecraftPumpLogClient';
import { MinecraftTailLogClient } from './MinecraftLogClient/MinecraftTailLogClient';
import StatisticsTracker from './StatisticsTracker';
import Storage from './Storage';
import StorageRegister from './StorageRegister';
import { formatTime } from './util/formatTime';

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
	logger.error(e);
	process.exit(1);
});

const config = loadConfig(storageDir);

Storage.rootDir = storageDir;

const options: DashBotOptions = {
	config,
	client: new DiscordClient(),
	logger,
};

if (config.minecraft) {
	if (config.minecraft.logClient) {
		switch (config.minecraft.logClient.type) {
			case 'webhook':
				if (config.tls) {
					options.minecraftClient = new MinecraftPumpLogClient({
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
						options.minecraftClient = new MinecraftPumpLogClient({
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
				options.minecraftClient = new MinecraftTailLogClient({
					logFilePath: config.minecraft.logClient.logFilePath,
					logger,
				});
				break;
		}
	}

	if (config.minecraft.rcon) {
		options.rcon = new Rcon(
			config.minecraft.rcon.host,
			config.minecraft.rcon.port,
			config.minecraft.rcon.password
		);
	}
}

const bot = new DashBot2(logger);
const storage = new StorageRegister('storage.json', logger);
const identityService = new IdentityService(storage);
const statistics = new StatisticsTracker();
storage.watch();

if (options.minecraftClient) {
	const mcServer = new MinecraftServer(
		options.minecraftClient,
		options.rcon || null,
		new StorageRegister('storage2.json', logger),
		identityService
	);
	bot.addServer(mcServer);
	identityService.addProvider(mcServer);
}

const dcServer = new DiscordServer(
	options.client,
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
statistics.register(petCommand);

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
// const bot = new DashBot(options);

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
