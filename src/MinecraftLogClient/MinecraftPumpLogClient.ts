import bodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { ChatMessage } from './ChatMessage';
import { LogMessage } from './LogMessage';
import { MinecraftLogClient } from './MinecraftLogClient';

export interface MinecraftPumpLogClientOptions {
	express: () => Express;
	port: number;
}

export class MinecraftPumpLogClient extends MinecraftLogClient {
	private readonly app: Express;
	private readonly port: number;
	private server: Server | null;

	constructor({ express, port }: MinecraftPumpLogClientOptions) {
		super();
		this.app = express();
		this.port = port;
		this.server = null;

		this.app.use(bodyParser.text());
		this.app.post<Record<string, string>, never, string>(
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
		if (this.server === null) {
			this.server = this.app.listen(this.port);
		}
	}

	stop() {
		this.server?.close();
		this.server = null;
	}
}
