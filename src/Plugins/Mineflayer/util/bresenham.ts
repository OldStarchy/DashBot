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

	if (dx === 0 && dy === 0 && dz === 0) {
		return points;
	}

	if (dx >= dy && dx >= dz) {
		let p1 = 2 * dy - dx;
		let p2 = 2 * dz - dx;
		const winSign = Math.sign(x1 - x2);
		while (Math.sign(x1 - x2) === winSign) {
			x1 += xs;
			if (p1 >= 0) {
				points.push({ x: x1, y: y1, z: z1 });
				y1 += ys;
				p1 -= 2 * dx;
			}
			if (p2 >= 0) {
				points.push({ x: x1, y: y1, z: z1 });
				z1 += zs;
				p2 -= 2 * dx;
			}
			p1 += 2 * dy;
			p2 += 2 * dz;
			points.push({ x: x1, y: y1, z: z1 });
		}
	} else if (dy >= dx && dy >= dz) {
		let p1 = 2 * dx - dy;
		let p2 = 2 * dz - dy;
		const winSign = Math.sign(y1 - y2);
		while (Math.sign(y1 - y2) === winSign) {
			y1 += ys;
			if (p1 >= 0) {
				points.push({ x: x1, y: y1, z: z1 });
				x1 += xs;
				p1 -= 2 * dy;
			}
			if (p2 >= 0) {
				points.push({ x: x1, y: y1, z: z1 });
				z1 += zs;
				p2 -= 2 * dy;
			}
			p1 += 2 * dx;
			p2 += 2 * dz;
			points.push({ x: x1, y: y1, z: z1 });
		}
	} else {
		let p1 = 2 * dy - dz;
		let p2 = 2 * dx - dz;
		const winSign = Math.sign(z1 - z2);
		while (Math.sign(z1 - z2) === winSign) {
			z1 += zs;
			if (p1 >= 0) {
				points.push({ x: x1, y: y1, z: z1 });
				y1 += ys;
				p1 -= 2 * dz;
			}
			if (p2 >= 0) {
				points.push({ x: x1, y: y1, z: z1 });
				x1 += xs;
				p2 -= 2 * dz;
			}
			p1 += 2 * dy;
			p2 += 2 * dx;
			points.push({ x: x1, y: y1, z: z1 });
		}
	}

	return points;
}
