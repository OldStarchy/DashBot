import { existsSync, readSync } from 'fs';
import { join } from 'path';

export interface DashbotConfig {
	/**
	 * Client ID taken from the discord developer site
	 */
	clientId?: string;
	/**
	 * Client Secret taken from the discord developer site
	 */
	clientSecret?: string;

	/**
	 * The Bot token taken from the discord developer site
	 */
	botToken: string;
	imgurClientId: string;
	imgurClientSecret: string;
	statsFileLocation: string;

	logToFile: boolean;
}

const configFileName = 'dashbot.config';
const searchPaths = ['config', '.', '..'];

const Config: DashbotConfig = (() => {
	const paths = searchPaths.map(path => join(path, configFileName));

	for (const path of paths) {
		try {
			const config = require('./' + path);
			console.log(`Loading config from "${path}"`);
			return config;
		} catch (ex) {}
	}

	throw new Error('Could not load config');
})();

export default Config;
