import { Vec3 } from 'vec3';

/**
 * Find the point at which line with slopes dy/dx and dz/dx intersects the nearest plane fx=-1, 0, 1, or 2 starting from point (fx, fy, fz)
 */
function findIntersection(
	fx: number,
	fy: number,
	fz: number,
	dx: number,
	dy: number,
	dz: number
) {
	const x = dx > 0 ? 1 : fx === 0 ? -1 : 0;

	const y = fy + ((dx < 0 ? -fx : 1 - fx) * dy) / dx;
	const z = fz + ((dx < 0 ? -fx : 1 - fx) * dz) / dx;

	return [
		isNaN(x) ? Infinity : x,
		isNaN(y) ? Infinity : y,
		isNaN(z) ? Infinity : z,
	];
}

/**
 * calls `callback` with the cell coordinates for each cell crossed by the line segment spanning from `start` to `end`, stopping iteration if the callback returns true
 */
export default function blockMarch(
	start: Vec3,
	end: Vec3,
	callback: (block: Vec3) => boolean
): void {
	let count = 50;
	while (count-- > 0) {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const dz = end.z - start.z;

		const fx = ((start.x % 1) + 1) % 1;
		const fy = ((start.y % 1) + 1) % 1;
		const fz = ((start.z % 1) + 1) % 1;

		const crossX = (((fx + 0.5) % 1) - 0.5) ** 2 < 0.01;
		const crossY = (((fy + 0.5) % 1) - 0.5) ** 2 < 0.01;
		const crossZ = (((fz + 0.5) % 1) - 0.5) ** 2 < 0.01;

		if (crossX && !crossY && !crossZ) {
			if (
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						Math.floor(start.y),
						Math.floor(start.z)
					)
				)
			)
				return;
		}

		if (!crossX && crossY && !crossZ) {
			if (
				callback(
					new Vec3(
						Math.floor(start.x),
						start.y + (dy < 0 ? -1 : 0),
						Math.floor(start.z)
					)
				)
			)
				return;
		}

		if (!crossX && !crossY && crossZ) {
			if (
				callback(
					new Vec3(
						Math.floor(start.x),
						Math.floor(start.y),
						start.z + (dz < 0 ? -1 : 0)
					)
				)
			)
				return;
		}

		if (crossX && crossY && !crossZ) {
			if (
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						start.y + (dy < 0 ? 0 : -1),
						Math.floor(start.z)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? 0 : -1),
						start.y + (dy < 0 ? -1 : 0),
						Math.floor(start.z)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						start.y + (dy < 0 ? -1 : 0),
						Math.floor(start.z)
					)
				)
			)
				return;
		}

		if (crossX && !crossY && crossZ) {
			if (
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						Math.floor(start.y),
						start.z + (dz < 0 ? 0 : -1)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? 0 : -1),
						Math.floor(start.y),
						start.z + (dz < 0 ? -1 : 0)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						Math.floor(start.y),
						start.z + (dz < 0 ? -1 : 0)
					)
				)
			)
				return;
		}

		if (!crossX && crossY && crossZ) {
			if (
				callback(
					new Vec3(
						Math.floor(start.x),
						start.y + (dy < 0 ? -1 : 0),
						start.z + (dz < 0 ? 0 : -1)
					)
				) ||
				callback(
					new Vec3(
						Math.floor(start.x),
						start.y + (dy < 0 ? 0 : -1),
						start.z + (dz < 0 ? -1 : 0)
					)
				) ||
				callback(
					new Vec3(
						Math.floor(start.x),
						start.y + (dy < 0 ? -1 : 0),
						start.z + (dz < 0 ? -1 : 0)
					)
				)
			)
				return;
		}

		if (crossX && crossY && crossZ) {
			if (
				callback(
					new Vec3(
						start.x + (dx < 0 ? 0 : -1),
						start.y + (dy < 0 ? -1 : 0),
						start.z + (dz < 0 ? -1 : 0)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						start.y + (dy < 0 ? 0 : -1),
						start.z + (dz < 0 ? -1 : 0)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? 0 : -1),
						start.y + (dy < 0 ? 0 : -1),
						start.z + (dz < 0 ? -1 : 0)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						start.y + (dy < 0 ? -1 : 0),
						start.z + (dz < 0 ? 0 : -1)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? 0 : -1),
						start.y + (dy < 0 ? -1 : 0),
						start.z + (dz < 0 ? 0 : -1)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						start.y + (dy < 0 ? 0 : -1),
						start.z + (dz < 0 ? 0 : -1)
					)
				) ||
				callback(
					new Vec3(
						start.x + (dx < 0 ? -1 : 0),
						start.y + (dy < 0 ? -1 : 0),
						start.z + (dz < 0 ? -1 : 0)
					)
				)
			)
				return;
		}

		if (!crossX && !crossY && !crossZ) {
			if (
				callback(
					new Vec3(
						Math.floor(start.x),
						Math.floor(start.y),
						Math.floor(start.z)
					)
				)
			)
				return;
		}

		if (
			Math.floor(start.x) === Math.floor(end.x) &&
			Math.floor(start.y) === Math.floor(end.y) &&
			Math.floor(start.z) === Math.floor(end.z)
		) {
			return;
		}

		//first x plane line cross
		const [xx, xy, xz] = findIntersection(fx, fy, fz, dx, dy, dz);

		//first y plane line cross
		const [yy, yz, yx] = findIntersection(fy, fz, fx, dy, dz, dx);

		//first z plane line cross
		const [zz, zx, zy] = findIntersection(fz, fx, fy, dz, dx, dy);

		const sqrDistX = (xx - fx) ** 2 + (xy - fy) ** 2 + (xz - fz) ** 2;
		const sqrDistY = (yx - fx) ** 2 + (yy - fy) ** 2 + (yz - fz) ** 2;
		const sqrDistZ = (zx - fx) ** 2 + (zy - fy) ** 2 + (zz - fz) ** 2;

		//The coordinates of the nearest intersection
		let hit: Vec3;

		if (sqrDistX <= sqrDistY && sqrDistX <= sqrDistZ) {
			//hit x plane line first;
			hit = new Vec3(
				Math.floor(start.x) + xx,
				Math.floor(start.y) + xy,
				Math.floor(start.z) + xz
			);
		} else if (sqrDistY <= sqrDistX && sqrDistY <= sqrDistZ) {
			//hit x plane line first;
			hit = new Vec3(
				Math.floor(start.x) + yx,
				Math.floor(start.y) + yy,
				Math.floor(start.z) + yz
			);
		} else {
			//hit z plane line first;
			hit = new Vec3(
				Math.floor(start.x) + zx,
				Math.floor(start.y) + zy,
				Math.floor(start.z) + zz
			);
		}
		start = hit;
	}
	// return blockMarch(hit, end, callback);
}
