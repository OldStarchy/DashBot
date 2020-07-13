export default function bresenham3D(
	x1: number,
	y1: number,
	z1: number,
	x2: number,
	y2: number,
	z2: number
) {
	const points = [{ x: x1, y: y1, z: z1 }];

	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const dz = Math.abs(z2 - z1);

	const xs = x2 > x1 ? 1 : -1;
	const ys = y2 > y1 ? 1 : -1;
	const zs = z2 > z1 ? 1 : -1;

	if (dx >= dy && dx >= dz) {
		let p1 = 2 * dy - dx;
		let p2 = 2 * dz - dx;
		while (x1 != x2) {
			x1 += xs;
			if (p1 >= 0) {
				y1 += ys;
				p1 -= 2 * dx;
				points.push({ x: x1, y: y1, z: z1 });
			}
			if (p2 >= 0) {
				z1 += zs;
				p2 -= 2 * dx;
				points.push({ x: x1, y: y1, z: z1 });
			}
			p1 += 2 * dy;
			p2 += 2 * dz;
			points.push({ x: x1, y: y1, z: z1 });
		}
	} else if (dy >= dx && dy >= dz) {
		let p1 = 2 * dx - dy;
		let p2 = 2 * dz - dy;
		while (y1 != y2) {
			y1 += ys;
			if (p1 >= 0) {
				x1 += xs;
				p1 -= 2 * dy;
				points.push({ x: x1, y: y1, z: z1 });
			}
			if (p2 >= 0) {
				z1 += zs;
				p2 -= 2 * dy;
				points.push({ x: x1, y: y1, z: z1 });
			}
			p1 += 2 * dx;
			p2 += 2 * dz;
			points.push({ x: x1, y: y1, z: z1 });
		}
	} else {
		let p1 = 2 * dy - dz;
		let p2 = 2 * dx - dz;
		while (z1 != z2) {
			z1 += zs;
			if (p1 >= 0) {
				y1 += ys;
				p1 -= 2 * dz;
				points.push({ x: x1, y: y1, z: z1 });
			}
			if (p2 >= 0) {
				x1 += xs;
				p2 -= 2 * dz;
				points.push({ x: x1, y: y1, z: z1 });
			}
			p1 += 2 * dy;
			p2 += 2 * dx;
			points.push({ x: x1, y: y1, z: z1 });
		}
	}

	return points;
}
