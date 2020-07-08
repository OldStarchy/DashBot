import bodyParser from 'body-parser';
import express from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Greenlock from 'greenlock-express';
import path from 'path';
import getVersion from './getVersion';
import loadConfig from './loadConfig';
import createLogger from './Startup/createLogger';
import handleCli from './Startup/handleCli';

const args = process.argv.slice(2);

const storageDir = handleCli(args);
const logger = createLogger(storageDir);

process.on('uncaughtException', e => {
	logger.error(e.message);
	process.exit(1);
});

const config = loadConfig(storageDir);

const app = express();

app.use(bodyParser.text());

app.get<ParamsDictionary, string, string>('/', (req, res) => {
	res.write('Hello, world!');
	res.end();
});

if (config.tls) {
	Greenlock.init({
		configDir: storageDir,
		maintainerEmail: config.tls!.maintainerEmail,
		packageAgent: config.tls!.packageAgent,
		packageRoot: path.dirname(__dirname),
		package: {
			name: config.botName!.replace(/[^\w\d]+/g, ''),
			version: getVersion(),
		},
	}).serve(app);
} else {
	app.listen(3030);
}
