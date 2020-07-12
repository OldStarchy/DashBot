import bodyParser from 'body-parser';
import { Express } from 'express';
import Greenlock from 'greenlock-express';
import { Server } from 'http';
import winston from 'winston';
import MinecraftLogClient from './MinecraftLogClient';

export interface MinecraftPumpLogClientOptions {
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

	whitelist?: string[];
}

export default class MinecraftPumpLogClient extends MinecraftLogClient {
	private readonly _app: Express;
	private _server: Server | null;

	constructor(private readonly _options: MinecraftPumpLogClientOptions) {
		super();
		this._app = _options.express();
		this._server = null;

		this._app.use(bodyParser.text());
		this._app.post<Record<string, string>, never, string>(
			'/v1/onLogChanged',
			(req, res) => {
				if (
					this._options.whitelist &&
					!this._options.whitelist.includes(req.ip)
				) {
					winston.warn(
						`Blocked request from invalid IP ${req.ip}`,
						req.ip
					);
					res.statusCode = 403;
					res.end();
					return;
				}

				const body = req.body;
				const messages = body.split(/[\n\r]+/g);

				messages
					.filter(line => line !== '')
					.forEach(line => this.onLineReceived(line));
				res.statusCode == 201;
				res.end();
			}
		);
	}

	start() {
		if (this._server === null) {
			if (this._options.greenlockConfig) {
				// TODO: https://git.rootprojects.org/root/greenlock-express.js/issues/36#issuecomment-9326
				Greenlock.init(this._options.greenlockConfig).serve(this._app);
			} else {
				this._server = this._app.listen(this._options.port || 80);
			}
		}
	}

	stop() {
		this._server?.close();
		this._server = null;
	}
}
