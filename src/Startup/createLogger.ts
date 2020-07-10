import { DateTime } from 'luxon';
import path from 'path';
import winston from 'winston';

export default function createLogger(storageDir: string) {
	const logger = winston.createLogger({
		level: 'info',
		format: winston.format.printf(
			({ service, level, message }) =>
				`${DateTime.utc()
					.setZone('Australia/Adelaide')
					.toISO()} [${service}] ${level}: ${message}`
		),
		defaultMeta: { service: 'dashbot' },
		transports: [
			new winston.transports.Console({ format: winston.format.simple() }),
			new winston.transports.File({
				filename: path.join(storageDir, 'dashbot.log'),
			}),
		],
	});

	logger.info('Logger created');

	return logger;
}
