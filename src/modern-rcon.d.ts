declare module 'modern-rcon' {
	class Rcon {
		constructor(host: string, password: string, timeout?: number);
		constructor(
			host: string,
			port: number,
			password: string,
			timeout?: number
		);
		connect(): Promise<void>;
		disconnect(): Promise<void>;
		send(data: string): Promise<string>;
		protected _handleResponse(data: Buffer): void;
	}

	class ExtendableError extends Error {
		constructor(message: string);
	}

	export class RconError extends ExtendableError {
		constructor(message: string);
	}

	export default Rcon;
}
