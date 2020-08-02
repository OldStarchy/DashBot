const PI = Math.PI;
const PI_2 = Math.PI * 2;

export function deltaYaw(yaw1: number, yaw2: number) {
	let dYaw = (yaw1 - yaw2) % PI_2;
	if (dYaw < -PI) dYaw += PI_2;
	else if (dYaw > PI) dYaw -= PI_2;

	return dYaw;
}
