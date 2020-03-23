import bodyParser from 'body-parser';
import { Express } from 'express';
import Greenlock from 'greenlock-express';
import { Server } from 'http';
import {
	MinecraftLogClient,
	MinecraftLogClientOptions,
} from './MinecraftLogClient';

export interface MinecraftPumpLogClientOptions
	extends MinecraftLogClientOptions {
	express: () => Express;
	/**
	 * Specify the port to use for a plain HTTP server, do not use with greenlockConfig
	 */
	port?: number;

	/**
	 * Configuration for automatic Lets Encrypt certificates. Uses default ports 80 and 443 which can't be changed.
	 * If this is set, the port option is ignored.
	 */
	greenlockConfig?: Greenlock.GreenlockOptions;
}

export class MinecraftPumpLogClient extends MinecraftLogClient {
	private readonly app: Express;
	private server: Server | null;

	constructor(private readonly options: MinecraftPumpLogClientOptions) {
		super(options);
		this.app = options.express();
		this.server = null;

		this.app.use(bodyParser.text());
		this.app.post<Record<string, string>, never, string>(
			'/v1/onLogChanged',
			(req, res) => {
				const body = req.body;
				const messages = body.split(/[\n\r]+/g);

				messages.forEach(line => this.onLineReceived(line));
				res.statusCode == 200;
				res.end();
			}
		);
	}

	start() {
		if (this.server === null) {
			if (this.options.greenlockConfig) {
				Greenlock.init(this.options.greenlockConfig).serve(this.app);
			} else {
				this.server = this.app.listen(this.options.port);
			}
		}
	}

	stop() {
		this.server?.close();
		this.server = null;
	}
}
