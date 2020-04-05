/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import getVersion from '../getVersion';

export default function handleCli(args: string[]) {
	if ((args.length == 1 && args[0] === '-v') || args[0] === '--version') {
		console.log(`DashBot ${getVersion()}`);
		process.exit(0);
	}

	const storageDir = path.resolve(
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

	if (!fs.existsSync(storageDir)) {
		throw new Error(
			`Can\'t find storage directory at "${storageDir}", make sure it exists`
		);
	}

	console.log(`Storage location set to ${storageDir}`);

	return storageDir;
}
