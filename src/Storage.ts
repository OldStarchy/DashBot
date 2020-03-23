import fs from 'fs';
import path from 'path';

export default class Storage<T extends {}> {
	public static rootDir = '.';

	public readonly data: T;

	constructor(private readonly file: string, def: () => T) {
		this.file = path.join(Storage.rootDir, file);

		if (fs.existsSync(this.file)) {
			try {
				this.data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
			} catch (e) {
				this.data = def();
				this.write();
			}
		} else {
			this.data = def();
			this.write();
		}
	}

	write() {
		fs.writeFileSync(this.file, JSON.stringify(this.data));
	}
}
