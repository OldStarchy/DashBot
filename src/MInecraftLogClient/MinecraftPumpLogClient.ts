import bodyParser from 'body-parser';
import * as ExpressCore from 'express-serve-static-core';
import { ChatMessage } from './ChatMessage';
import { LogMessage } from './LogMessage';
import { MinecraftLogClient } from './MinecraftLogClient';

export interface MinecraftPumpLogClientOptions {
	express: () => ExpressCore.Express;
	port: number;
}

export class MinecraftPumpLogClient extends MinecraftLogClient {
	private readonly app: ExpressCore.Express;
	private readonly port: number;

	constructor({ express, port }: MinecraftPumpLogClientOptions) {
		super();
		this.app = express();
		this.port = port;

		this.app.use(bodyParser.text());
		this.app.post<ExpressCore.ParamsDictionary, never, string>(
			'/v1/onLogChanged',
			(req, res) => {
				const body = req.body;
				const messages = body
					.split('\n')
					.map(LogMessage.parse)
					.filter(message => message != null) as LogMessage[];

				const chatMessages = messages.filter(
					message => message instanceof ChatMessage
				) as ChatMessage[];

				chatMessages.forEach(chatMessage => {
					try {
						this.emit('chatMessage', chatMessage);
					} catch {}
				});
				res.statusCode == 200;
				res.end();
			}
		);
	}

	start() {
		this.app.listen(this.port);
	}
}
