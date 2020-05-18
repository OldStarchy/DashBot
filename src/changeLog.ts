type ChangeLog = {
	[version: string]: {
		Added?: string[];
		Updated?: string[];
		Removed?: string[];
		Fixed?: string[];
	};
};

const changeLog: ChangeLog = {
	'0.2.7': {},
	'0.2.6': {
		Added: ['Quiz game (WIP) start playing with "play quiz"'],
		Updated: [
			'EventEmitter is better and covered by tests.',
			'EventEmitter now has a emitAsync function',
		],
	},
	'0.2.5': {
		Added: [
			'Murderers in MineCraft now get ahead of the competition',
			'Super basic change log',
		],
	},
};

export default changeLog;
