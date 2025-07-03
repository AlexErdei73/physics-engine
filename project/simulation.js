let state;

function deleteAcceleration() {
	const { points } = state;
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		if (!point.isFixed) {
			point.ax = 0;
			point.ay = 0;
			point.axmid = 0;
			point.aymid = 0;
		}
	}
}

export function init(initialState) {
	state = JSON.parse(JSON.stringify(initialState));
	deleteAcceleration();
}

function calcForce(rod, isMidpoint = false) {
	const { points } = state;
	const { point1, point2, length: l0, elast: D, beta } = rod;
	let { x: x1, y: y1, vx: vx1, vy: vy1, isFixed: isFixed1 } = points[point1];
	let { x: x2, y: y2, vx: vx2, vy: vy2, isFixed: isFixed2 } = points[point2];
	if (isMidpoint) {
		if (!isFixed1) {
			const {
				xmid: xmid1,
				ymid: ymid1,
				vxmid: vx1mid,
				vymid: vy1mid,
			} = points[point1];
			x1 = xmid1;
			y1 = ymid1;
			vx1 = vx1mid;
			vy1 = vy1mid;
		}
		if (!isFixed2) {
			const {
				xmid: xmid2,
				ymid: ymid2,
				vxmid: vx2mid,
				vymid: vy2mid,
			} = points[point2];
			x2 = xmid2;
			y2 = ymid2;
			vx2 = vx2mid;
			vy2 = vy2mid;
		}
	}
	const l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	let F = D * (l - l0);
	if (beta > 0) {
		vx1 = vx1 || 0;
		vx2 = vx2 || 0;
		vy1 = vy1 || 0;
		vy2 = vy2 || 0;
		const vr1 = (vx1 * (x2 - x1)) / l + (vy1 * (y2 - y1)) / l;
		const vr2 = (vx2 * (x2 - x1)) / l + (vy2 * (y2 - y1)) / l;
		F += beta * (vr2 - vr1);
	}
	rod.Fx = (F * (x2 - x1)) / l;
	rod.Fy = (F * (y2 - y1)) / l;
}

function calcGrav(point, isMidpoint = false) {
	if (point.isFixed) return;
	const { g } = state;
	if (isMidpoint) point.aymid += g;
	else point.ay += g;
}

function calcPeriodicExtForce(state, isMidpoint = false) {
	const { periodicExtForce, points, t: t0, dt } = state;
	if (!periodicExtForce) return;
	const {
		tMin,
		tMax,
		F0x,
		F0y,
		fix,
		fiy,
		omega,
		point: pointIndex,
		isOn,
	} = periodicExtForce;
	if (
		!isOn ||
		t0 < tMin ||
		(tMax && t0 > tMax) ||
		(!pointIndex && pointIndex !== 0) ||
		pointIndex < 0 ||
		pointIndex >= points.length
	) {
		periodicExtForce.Fx = 0;
		periodicExtForce.Fy = 0;
		return;
	}
	const point = points[pointIndex];
	let t = t0;
	if (isMidpoint) t += dt / 2;
	const Fx = F0x > 0 ? F0x * Math.sin(omega * t + fix) : 0;
	const Fy = F0y > 0 ? F0y * Math.sin(omega * t + fiy) : 0;
	if (isMidpoint) {
		point.axmid += Fx / point.m;
		point.aymid += Fy / point.m;
	} else {
		periodicExtForce.Fx = Fx;
		periodicExtForce.Fy = Fy;
		point.ax += Fx / point.m;
		point.ay += Fy / point.m;
	}
}

function calcAccelerations(isMidpoint = false) {
	const { points, rods } = state;

	for (let i = 0; i < rods.length; i++) {
		const rod = rods[i];
		calcForce(rod, isMidpoint);
		const { Fx, Fy } = rod;
		const point1 = points[rod.point1];
		const point2 = points[rod.point2];
		const { m: m1 } = point1;
		const { m: m2 } = point2;
		if (isMidpoint) {
			if (!point1.isFixed) {
				point1.axmid += Fx / m1;
				point1.aymid += Fy / m1;
			}
			if (!point2.isFixed) {
				point2.axmid -= Fx / m2;
				point2.aymid -= Fy / m2;
			}
		} else {
			if (!point1.isFixed) {
				point1.ax += Fx / m1;
				point1.ay += Fy / m1;
			}
			if (!point2.isFixed) {
				point2.ax -= Fx / m2;
				point2.ay -= Fy / m2;
			}
		}
	}

	for (let i = 0; i < points.length; i++) {
		calcGrav(points[i], isMidpoint);
	}

	calcPeriodicExtForce(state, isMidpoint);
}

function stepEulerRichardson() {
	const { points, dt } = state;
	deleteAcceleration();
	calcAccelerations();
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		if (!point.isFixed) {
			const { x, y, ax, ay, vx, vy } = point;
			const halfdt = 0.5 * dt;
			point.xmid = x + vx * halfdt;
			point.ymid = y + vy * halfdt;
			point.vxmid = vx + ax * halfdt;
			point.vymid = vy + ay * halfdt;
		}
	}
	calcAccelerations(true);
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		if (!point.isFixed) {
			const { axmid, aymid, vxmid, vymid } = point;
			point.vx += axmid * dt;
			point.vy += aymid * dt;
			point.x += vxmid * dt;
			point.y += vymid * dt;
		}
	}
}

export function simulate() {
	const { t: t0, animTime, dt } = state;
	let t = t0;
	while (t < t0 + animTime) {
		t += dt;
		stepEulerRichardson();
	}
	state.t = t;
	return state;
}
