import { expect, spy, use } from 'chai';
import spies from 'chai-spies';
import 'mocha';
import { CancellableEvent, Event, PublicEventEmitter } from '../src/Events';

use(spies);

interface TestEvents {
	nullValue: null;
	other: null;
	numberValue: number;
	stringValue: string;
	'parentEvent.*': null;
	'parentEvent.childEventNull': null;
}

describe('Events', () => {
	it('Should fire basic events', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('nullValue', handler);
		emitter.emit(new Event('nullValue', null));

		expect(handler).to.have.been.called();
	});

	it('Should fire basic events multiple times', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('nullValue', handler);
		emitter.emit(new Event('nullValue', null));
		emitter.emit(new Event('nullValue', null));

		expect(handler).to.have.been.called.twice;
	});

	it('Should not fire other handlers', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('other', handler);
		emitter.emit(new Event('nullValue', null));

		expect(handler).to.not.have.been.called();
	});

	it('Should fire once handlers once', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy(() => {
			void 0;
		});

		emitter.once('nullValue', handler);
		emitter.emit(new Event('nullValue', null));
		emitter.emit(new Event('nullValue', null));

		expect(handler).to.have.been.called.once;
	});

	it('Should not fire removed handlers', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('nullValue', handler);
		emitter.off('nullValue', handler);
		emitter.emit(new Event('nullValue', null));

		expect(handler).to.not.have.been.called();
	});

	it('Should pass event data', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy((e: Event<'stringValue', string>) => {
			expect(e.data).to.be.equal('foo');
		});

		emitter.on('stringValue', handler);
		emitter.emit(new Event('stringValue', 'foo'));

		expect(handler).to.have.been.called();
	});

	it('Should fire wildcard handlers', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('parentEvent.*', handler);
		emitter.emit(new Event('parentEvent.childEventNull', null));

		expect(handler).to.have.been.called();
	});

	it('Should remove items by key', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler1 = spy(() => {
			void 0;
		});

		emitter.on('nullValue', handler1, 'foo');
		emitter.off('nullValue', handler1);
		emitter.emit(new Event('nullValue', null));
		expect(handler1).to.have.been.called();

		const handler2 = spy(() => {
			void 0;
		});

		emitter.on('nullValue', handler2, 'foo');
		emitter.off('nullValue', 'foo');
		emitter.emit(new Event('nullValue', null));
		expect(handler2).to.not.have.been.called();
	});

	it("Should not crash when removing handlers that weren't added", () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		emitter.off('nullValue', 'foo');
	});

	it('Should not crash when firing unbound events', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		emitter.emit(new Event('nullValue', null));
	});

	it('Should not continue firing cancelled events', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler1 = spy(() => {
			void 0;
		});

		const handler2 = spy((e: Event<'nullValue', null>) => {
			e.cancel();
		});

		const handler3 = spy(() => {
			void 0;
		});

		emitter.on('nullValue', handler1);
		emitter.on('nullValue', handler2);
		emitter.on('nullValue', handler3);

		emitter.emit(new CancellableEvent('nullValue', null));

		expect(handler1).to.have.been.called();
		expect(handler2).to.have.been.called();
		expect(handler3).to.not.have.been.called();
	});

	it('Removing handlers during emit should not cause other handlers to be skipped', () => {
		const emitter = new PublicEventEmitter<TestEvents>();

		const handler1 = spy(() => {
			void 0;
		});

		const handler2 = spy(() => {
			void 0;
		});

		const handler3 = spy(() => {
			void 0;
		});

		emitter.once('nullValue', handler1);
		emitter.once('nullValue', handler2);
		emitter.once('nullValue', handler3);

		emitter.emit(new Event('nullValue', null));

		expect(handler1).to.have.been.called();
		expect(handler2).to.have.been.called();
		expect(handler3).to.have.been.called();
	});
});
