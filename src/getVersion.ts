import fs from 'fs';
import path from 'path';

export function getVersion() {
	const location = path.join(__dirname, 'version');
	if (fs.existsSync(location)) {
		const version = fs.readFileSync(location, 'utf8');

		if (
			/((pre|alpha|beta|rc)-)?\d+\.\d+\.\d+(-\w*(\.\d+)?)?/.test(version)
		) {
			return version;
		}

		return 'unknown';
	} else {
		return 'unknown';
	}
}
