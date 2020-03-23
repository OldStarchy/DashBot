declare module 'greenlock-express' {
	export interface GreenlockConfig {
		sites: {
			subject: string;
			altnames: string[];
		}[];
	}

	export interface GreenlockOptions {
		packageRoot: string;
		packageAgent?: string;
		configDir: string;
		maintainerEmail: string;
		cluster?: boolean;
		package: {
			name: string;
			version: string;
		};
	}

	export interface Greenlock {
		serve(app: import('express').Express): void;
	}

	export function init(options: GreenlockOptions): Greenlock;
}
