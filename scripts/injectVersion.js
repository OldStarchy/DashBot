/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const package = require('../package.json');
const fs = require('fs');
const path = require('path');

const version = package.version;
const location = path.join(__dirname, '..', 'dist');
const filename = path.join(location, 'version');

const args = process.argv;
args.shift(); // node.exe
args.shift(); // injectVersion.js

let mode;
if (args.length > 0) {
	switch (args[0]) {
		case '--dev':
		case '--development':
			mode = 'development';
			break;

		case '--prod':
		case '--production':
		default:
			mode = 'production';
			break;
	}
}

if (!fs.existsSync(location)) {
	console.warn('Created dist directory for version injection');
	fs.mkdirSync(location, { recursive: true });
}

const modeStr = mode === 'development' ? '@dev' : '';
const versionStr = `v${version}${modeStr}`;
fs.writeFileSync(filename, versionStr);
console.log(`Version ${versionStr} injected at ${path.resolve(location)}`);
