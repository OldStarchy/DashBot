import deepExtend from 'deep-extend';
import { join } from 'path';
import getVersion from './getVersion';

export default function loadConfig(storageDir: string): DashBotConfig {
	const configFileName = 'dashbot.config';
	const path = join(storageDir, configFileName);

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const loadedConfig = require(path) as DashBotConfig;

	const defaultConfig: Omit<DashBotConfig, 'discordBotToken'> = {
		botName: 'DashBot',
		debug: false,
	};

	const config = deepExtend(defaultConfig, loadedConfig);

	if (!config.discordBotToken) {
		throw new Error('Missing config.discordBotToken');
	}

	if (config.tls) {
		if (!config.tls.maintainerEmail) {
			throw new Error('Missing config.tls.maintainerEmail');
		}

		config.tls = deepExtend(
			{
				packageAgent: config.botName + '/' + getVersion(),
			},
			config.tls
		);
	}

	return config as DashBotConfig;
}
