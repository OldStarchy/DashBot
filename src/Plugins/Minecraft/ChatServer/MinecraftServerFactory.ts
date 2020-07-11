import express from 'express';
import { Logger } from 'winston';
import IdentityService from '../../../ChatServer/IdentityService';
import getVersion from '../../../getVersion';
import StorageRegister from '../../../StorageRegister';
import MinecraftLogClient from '../LogClient/MinecraftLogClient';
import MinecraftPumpLogClient from '../LogClient/MinecraftPumpLogClient';
import MinecraftTailLogClient from '../LogClient/MinecraftTailLogClient';
import RconClient from '../Rcon/RconClient';
import RconSocket from '../Rcon/RconSocket';
import MinecraftServer from './MinecraftServer';

export default class MinecraftServerFactory {
	make(
		serverConfig: MinecraftServerConfig,
		storage: StorageRegister,
		identityService: IdentityService,
		config: DashBotConfig,
		storageDir: string,
		packageRoot: string,
		logger: Logger
	): MinecraftServer {
		let minecraftClient: MinecraftLogClient | null = null;
		let rcon: RconClient | null = null;

		if (serverConfig.logClient) {
			switch (serverConfig.logClient.type) {
				case 'webhook':
					if (config.tls) {
						minecraftClient = new MinecraftPumpLogClient({
							express,
							greenlockConfig: {
								maintainerEmail: config.tls.maintainerEmail,
								packageAgent: config.tls.packageAgent,
								configDir: storageDir,
								packageRoot,
								cluster: false,
								package: {
									name: config.botName!.replace(
										/[^\w\d]+/g,
										''
									),
									version: getVersion(),
								},
							},
							whitelist: serverConfig.logClient.whitelist,
							logger,
						});
					} else {
						if (serverConfig.logClient.allowInsecure) {
							minecraftClient = new MinecraftPumpLogClient({
								express,
								logger,
								whitelist: serverConfig.logClient.whitelist,
							});
						} else {
							throw new Error(
								".logClient.type is 'webhook' but .logClient.allowInsecure is false and config.tls is not set"
							);
						}
					}
					break;

				case 'tail':
					minecraftClient = new MinecraftTailLogClient({
						logFilePath: serverConfig.logClient.logFilePath,
						logger,
					});
					break;
			}
		}

		if (serverConfig.rcon) {
			rcon = new RconClient(
				new RconSocket(
					serverConfig.rcon.host,
					serverConfig.rcon.port,
					serverConfig.rcon.password
				),
				logger
			);
		}

		if (minecraftClient) {
			return new MinecraftServer(
				serverConfig.id ?? 'Minecraft',
				minecraftClient,
				rcon || null,
				storage,
				identityService,
				config.botName!
			);
		}

		throw new Error(`Couldn't create minecraft server`);
	}
}
