/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const package = require('../package.json');
const fs = require('fs');
const path = require('path');

const version = package.version;
const location = path.join(__dirname, '..', 'dist');
const filename = path.join(location, 'version');

if (!fs.existsSync(location)) {
	console.warn('Created dist directory for version injection');
	fs.mkdirSync(location, { recursive: true });
}

fs.writeFileSync(filename, `v${version}`);
console.log(`Version ${version} injected at ${path.resolve(location)}`);
