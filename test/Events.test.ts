import { expect, spy, use } from 'chai';
import spies from 'chai-spies';
import 'mocha';
import { CancellableEvent, Event, EventEmitter } from '../src/Events';

use(spies);

describe('Events', () => {
	it('Should fire basic events', () => {
		const emitter = new EventEmitter();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('basic', handler);
		emitter.emit(new Event('basic', null));

		expect(handler).to.have.been.called();
	});

	it('Should fire basic events multiple times', () => {
		const emitter = new EventEmitter();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('basic', handler);
		emitter.emit(new Event('basic', null));
		emitter.emit(new Event('basic', null));

		expect(handler).to.have.been.called.twice;
	});

	it('Should not fire other handlers', () => {
		const emitter = new EventEmitter();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('other', handler);
		emitter.emit(new Event('basic', null));

		expect(handler).to.not.have.been.called();
	});

	it('Should fire once handlers once', () => {
		const emitter = new EventEmitter();

		const handler = spy(() => {
			void 0;
		});

		emitter.once('basic', handler);
		emitter.emit(new Event('basic', null));
		emitter.emit(new Event('basic', null));

		expect(handler).to.have.been.called.once;
	});

	it('Should not fire removed handlers', () => {
		const emitter = new EventEmitter();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('basic', handler);
		emitter.off('basic', handler);
		emitter.emit(new Event('basic', null));

		expect(handler).to.not.have.been.called();
	});

	it('Should pass event data', () => {
		const emitter = new EventEmitter();

		const handler = spy((e: Event<string>) => {
			expect(e.data).to.be.equal('foo');
		});

		emitter.on('basic', handler);
		emitter.emit(new Event('basic', 'foo'));

		expect(handler).to.have.been.called();
	});

	it('Should fire wildcard handlers', () => {
		const emitter = new EventEmitter();

		const handler = spy(() => {
			void 0;
		});

		emitter.on('basic.*', handler);
		emitter.emit(new Event('basic.baz', null));

		expect(handler).to.have.been.called();
	});

	it('Should remove items by key', () => {
		const emitter = new EventEmitter();

		const handler1 = spy(() => {
			void 0;
		});

		emitter.on('basic', handler1, 'foo');
		emitter.off('basic', handler1);
		emitter.emit(new Event('basic', null));
		expect(handler1).to.have.been.called();

		const handler2 = spy(() => {
			void 0;
		});

		emitter.on('basic', handler2, 'foo');
		emitter.off('basic', 'foo');
		emitter.emit(new Event('basic', null));
		expect(handler2).to.not.have.been.called();
	});

	it("Should not crash when removing handlers that weren't added", () => {
		const emitter = new EventEmitter();

		emitter.off('basic', 'foo');
	});

	it('Should not crash when firing unbound events', () => {
		const emitter = new EventEmitter();

		emitter.emit(new Event('basic', null));
	});

	it('Should not continue firing cancelled events', () => {
		const emitter = new EventEmitter();

		const handler1 = spy(() => {
			void 0;
		});

		const handler2 = spy((e: Event<null>) => {
			e.cancel();
		});

		const handler3 = spy(() => {
			void 0;
		});

		emitter.on('basic', handler1);
		emitter.on('basic', handler2);
		emitter.on('basic', handler3);

		emitter.emit(new CancellableEvent('basic', null));

		expect(handler1).to.have.been.called();
		expect(handler2).to.have.been.called();
		expect(handler3).to.not.have.been.called();
	});

	it('Removing handlers during emit should not cause other handlers to be skipped', () => {
		const emitter = new EventEmitter();

		const handler1 = spy(() => {
			void 0;
		});

		const handler2 = spy(() => {
			void 0;
		});

		const handler3 = spy(() => {
			void 0;
		});

		emitter.once('basic', handler1);
		emitter.once('basic', handler2);
		emitter.once('basic', handler3);

		emitter.emit(new Event('basic', null));

		expect(handler1).to.have.been.called();
		expect(handler2).to.have.been.called();
		expect(handler3).to.have.been.called();
	});
});
