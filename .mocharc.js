//@ts-check
'use strict';

/**
 *  @type {(
 *     	& import('mocha').MochaOptions
 *     	& {
 * 		   	diff?: boolean;
 *     	   	extension?: string[];
 *         	require?: string[]
 *         	'watch-files'?: string[];
 *         	'watch-ignore'?: string[];
 *     	}
 *  )} options
 */
const options = {
	diff: true,
	extension: ['ts'],
	require: ['ts-node/register', 'source-map-support/register'],
	slow: 75,
	timeout: 2000,
	ui: 'bdd',
	'watch-files': ['src/**/*.ts', 'test/**/*.test.ts'],
	'watch-ignore': ['node_modules', '.git'],
};

module.exports = options;
