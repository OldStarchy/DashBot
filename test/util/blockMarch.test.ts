/* eslint-disable no-console */
import { expect } from 'chai';
import { Vec3 } from 'vec3';
import blockMarch from '../../src/Plugins/Mineflayer/util/blockMarch';

describe('blockMarch', () => {
	it('works when going nowhere', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(0.5, 0.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([[0, 0, 0]]);
	});

	it('goes along x', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(2.5, 0.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[1, 0, 0],
			[2, 0, 0],
		]);
	});

	it('goes along x and a bit of y', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(2.5, 1.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[1, 0, 0],
			[1, 1, 0],
			[2, 1, 0],
		]);
	});

	it('goes along x and a bit of -y', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(2.5, -0.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[1, 0, 0],
			[1, -1, 0],
			[2, -1, 0],
		]);
	});

	it('goes along x and a bit of z', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(2.5, 0.5, 1.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[1, 0, 0],
			[1, 0, 1],
			[2, 0, 1],
		]);
	});

	it('goes along x and a bit of -z', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(2.5, 0.5, -0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[1, 0, 0],
			[1, 0, -1],
			[2, 0, -1],
		]);
	});

	it('hits every block around a z edge', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(1.5, 1.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks.shift()).to.deep.equal([0, 0, 0]);
		expect(blocks.pop()).to.deep.equal([1, 1, 0]);

		const hash = ([a, b, c]: number[]) => a * 1000000 + b * 1000 + c;
		blocks.sort((a, b) => hash(a) - hash(b));
		expect(blocks).to.deep.equal(
			[
				[1, 0, 0],
				[0, 1, 0],
			].sort((a, b) => hash(a) - hash(b))
		);
	});
	it('hits every block around a x edge', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(0.5, 1.5, 1.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks.shift()).to.deep.equal([0, 0, 0]);
		expect(blocks.pop()).to.deep.equal([0, 1, 1]);

		const hash = ([a, b, c]: number[]) => a * 1000000 + b * 1000 + c;
		blocks.sort((a, b) => hash(a) - hash(b));
		expect(blocks).to.deep.equal(
			[
				[0, 1, 0],
				[0, 0, 1],
			].sort((a, b) => hash(a) - hash(b))
		);
	});

	it('hits every block around a y edge', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(1.5, 0.5, 1.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks.shift()).to.deep.equal([0, 0, 0]);
		expect(blocks.pop()).to.deep.equal([1, 0, 1]);

		const hash = ([a, b, c]: number[]) => a * 1000000 + b * 1000 + c;
		blocks.sort((a, b) => hash(a) - hash(b));
		expect(blocks).to.deep.equal(
			[
				[1, 0, 0],
				[0, 0, 1],
			].sort((a, b) => hash(a) - hash(b))
		);
	});

	it('hits every block around a corner', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(1.5, 1.5, 1.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks.shift()).to.deep.equal([0, 0, 0]);
		expect(blocks.pop()).to.deep.equal([1, 1, 1]);

		const hash = ([a, b, c]: number[]) => a * 1000000 + b * 1000 + c;
		blocks.sort((a, b) => hash(a) - hash(b));
		expect(blocks).to.deep.equal(
			[
				[1, 0, 0],
				[1, 1, 0],
				[0, 1, 0],
				[0, 1, 1],
				[0, 0, 1],
				[1, 0, 1],
			].sort((a, b) => hash(a) - hash(b))
		);
	});

	it('goes in a straight x line', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(10.5, 0.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[1, 0, 0],
			[2, 0, 0],
			[3, 0, 0],
			[4, 0, 0],
			[5, 0, 0],
			[6, 0, 0],
			[7, 0, 0],
			[8, 0, 0],
			[9, 0, 0],
			[10, 0, 0],
		]);
	});

	it('goes in a straight y line', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(0.5, 10.5, 0.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[0, 1, 0],
			[0, 2, 0],
			[0, 3, 0],
			[0, 4, 0],
			[0, 5, 0],
			[0, 6, 0],
			[0, 7, 0],
			[0, 8, 0],
			[0, 9, 0],
			[0, 10, 0],
		]);
	});

	it('goes in a straight z line', () => {
		const blocks: number[][] = [];
		blockMarch(new Vec3(0.5, 0.5, 0.5), new Vec3(0.5, 0.5, 10.5), pos => {
			blocks.push(pos.toArray());
			return false;
		});

		expect(blocks).to.deep.equal([
			[0, 0, 0],
			[0, 0, 1],
			[0, 0, 2],
			[0, 0, 3],
			[0, 0, 4],
			[0, 0, 5],
			[0, 0, 6],
			[0, 0, 7],
			[0, 0, 8],
			[0, 0, 9],
			[0, 0, 10],
		]);
	});

	it('goes in a straight long y line', () => {
		const blocks: number[][] = [];
		blockMarch(
			new Vec3(-243.4031346134102, 74, 203.5538573850802),
			new Vec3(-243.44600102135948, 64, 203.2303360827917),
			pos => {
				blocks.push(pos.toArray());
				console.log(pos.toString());
				return false;
			}
		);

		expect(blocks).to.deep.equal([
			[-244, 73, 203],
			[-244, 72, 203],
			[-244, 71, 203],
			[-244, 70, 203],
			[-244, 69, 203],
			[-244, 68, 203],
			[-244, 67, 203],
			[-244, 66, 203],
			[-244, 65, 203],
			[-244, 64, 203],
		]);
	});
});
