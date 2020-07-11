import express from 'express';
import { Logger } from 'winston';
import IdentityService from '../../../ChatServer/IdentityService';
import getVersion from '../../../getVersion';
import StorageRegister from '../../../StorageRegister';
import MinecraftPumpLogClient from '../LogClient/MinecraftPumpLogClient';
import MinecraftTailLogClient from '../LogClient/MinecraftTailLogClient';
import RconClient from '../Rcon/RconClient';
import RconSocket from '../Rcon/RconSocket';
import MinecraftServer from './MinecraftServer';

interface MinecraftServerFactoryContext {
	storage: StorageRegister;
	identityService: IdentityService;
	config: DashBotConfig;
	storageDir: string;
	packageRoot: string;
	logger: Logger;
}

export default class MinecraftServerFactory {
	make(
		serverConfig: MinecraftServerConfig,
		context: MinecraftServerFactoryContext
	): MinecraftServer {
		const id = serverConfig.id;

		const {
			storage,
			identityService,
			config: { botName },
		} = context;

		const logClient = this.makeLogClient(serverConfig, context);
		if (!logClient) {
			throw new Error(`Couldn't create minecraft server`);
		}

		const rcon = this.makeRconClient(serverConfig, context);

		return new MinecraftServer({
			id: id ?? 'Minecraft',
			logClient,
			rcon,
			storage,
			identityService,
			botName: botName!,
		});
	}

	private makeRconClient(
		serverConfig: MinecraftServerConfig,
		context: {
			logger: Logger;
		}
	) {
		const { rcon: rconConfig } = serverConfig;
		const { logger } = context;

		if (!rconConfig) return null;

		return new RconClient(
			new RconSocket(
				rconConfig.host,
				rconConfig.port,
				rconConfig.password
			),
			logger
		);
	}

	private makeLogClient(
		{ logClient }: MinecraftServerConfig,
		{
			config: { tls, botName },
			storageDir,
			packageRoot,
			logger,
		}: {
			config: DashBotConfig;
			storageDir: string;
			packageRoot: string;
			logger: Logger;
		}
	) {
		if (!logClient) {
			return null;
		}

		if (logClient.type === 'webhook' && !tls && !logClient.allowInsecure) {
			throw new Error(
				".logClient.type is 'webhook' but .logClient.allowInsecure is false and config.tls is not set"
			);
		}

		switch (logClient.type) {
			case 'webhook':
				if (tls) {
					return new MinecraftPumpLogClient({
						express,
						greenlockConfig: {
							maintainerEmail: tls.maintainerEmail,
							packageAgent: tls.packageAgent,
							configDir: storageDir,
							packageRoot,
							cluster: false,
							package: {
								name: botName!.replace(/[^\w\d]+/g, ''),
								version: getVersion(),
							},
						},
						whitelist: logClient.whitelist,
						logger,
					});
				} else {
					return new MinecraftPumpLogClient({
						express,
						logger,
						whitelist: logClient.whitelist,
					});
				}

			case 'tail':
				return new MinecraftTailLogClient({
					logFilePath: logClient.logFilePath,
					logger,
				});
		}
	}
}
