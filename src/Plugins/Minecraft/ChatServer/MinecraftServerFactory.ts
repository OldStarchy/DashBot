import express from 'express';
import IdentityService from '../../../ChatServer/IdentityService';
import getVersion from '../../../getVersion';
import StorageRegister from '../../../StorageRegister';
import MinecraftPumpLogClient from '../LogClient/MinecraftPumpLogClient';
import MinecraftTailLogClient from '../LogClient/MinecraftTailLogClient';
import RconClient from '../Rcon/RconClient';
import RconSocket from '../Rcon/RconSocket';
import MinecraftIdentityCache from './MinecraftIdentityCache';
import MinecraftServer from './MinecraftServer';

interface MinecraftServerFactoryContext {
	storage: StorageRegister;
	identityService: IdentityService;
	minecraftIdentityCache: MinecraftIdentityCache;
	config: DashBotConfig;
	storageDir: string;
	packageRoot: string;
}

export default class MinecraftServerFactory {
	make(
		serverConfig: MinecraftServerConfig,
		context: MinecraftServerFactoryContext
	): MinecraftServer {
		const { id, knownBotUsernames } = serverConfig;

		const {
			identityService,
			config: { botName },
			minecraftIdentityCache,
		} = context;

		const logClient = this.makeLogClient(serverConfig, context);
		if (!logClient) {
			throw new Error(`Couldn't create minecraft server`);
		}

		const rcon = this.makeRconClient(serverConfig);

		return new MinecraftServer({
			id: id ?? 'Minecraft',
			logClient,
			rcon,
			minecraftIdentityCache,
			identityService,
			botName: botName!,
			knownBotUsernames: knownBotUsernames ?? [],
		});
	}

	private makeRconClient(serverConfig: MinecraftServerConfig) {
		const { rcon: rconConfig } = serverConfig;

		if (!rconConfig) return null;

		return new RconClient(
			new RconSocket(
				rconConfig.host,
				rconConfig.port,
				rconConfig.password
			)
		);
	}

	private makeLogClient(
		{ logClient }: MinecraftServerConfig,
		{
			config: { tls, botName },
			storageDir,
			packageRoot,
		}: {
			config: DashBotConfig;
			storageDir: string;
			packageRoot: string;
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
					});
				} else {
					return new MinecraftPumpLogClient({
						express,
						whitelist: logClient.whitelist,
					});
				}

			case 'tail':
				return new MinecraftTailLogClient({
					logFilePath: logClient.logFilePath,
				});
		}
	}
}
