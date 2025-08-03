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

function calcDistDot(rod, pointIndex, isMidpoint) {
	const { points } = state;
	const point = points[pointIndex];
	const { point1, point2 } = rod;
	let { x: x0, y: y0, vx: vx0, vy: vy0 } = point;
	let { x: x1, y: y1, vx: vx1, vy: vy1, isFixed: isFixed1 } = points[point1];
	let { x: x2, y: y2, vx: vx2, vy: vy2, isFixed: isFixed2 } = points[point2];
	vx1 = vx1 || 0;
	vy1 = vy1 || 0;
	vx2 = vx2 || 0;
	vy2 = vy2 || 0;
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
		const { xmid: xmid0, ymid: ymid0, vxmid: vx0mid, vymid: vy0mid } = point;
		x0 = xmid0;
		y0 = ymid0;
		vx0 = vx0mid;
		vy0 = vy0mid;
	}
	const v = {
		x: x2 - x1,
		y: y2 - y1,
		len: 0,
	};
	v.len = Math.sqrt(v.x * v.x + v.y * v.y);
	const V = v.len * v.len;
	const vDot = {
		x: vx2 - vx1,
		y: vy2 - vy1,
	};
	const VDot = 2 * (v.x * vDot.x + v.y * vDot.y);
	const Ux = v.x * v.x * x0 + v.y * v.y * x1 + v.x * v.y * (y0 - y1);
	const Uy = v.x * v.x * y1 + v.y * v.y * y0 + v.x * v.y * (x0 - x1);
	const xM = Ux / V;
	const yM = Uy / V;
	const n = {
		x: x0 - xM,
		y: y0 - yM,
	};
	n.len = Math.sqrt(n.x * n.x + n.y * n.y);
	const UxDot =
		2 * (v.x * vDot.x * x0 + v.y * vDot.y * x1) +
		(v.x * v.x * vx0 + v.y * v.y * vx1) +
		(vDot.x * v.y + v.x * vDot.y) * (y0 - y1) +
		v.x * v.y * (vy0 - vy1);
	const UyDot =
		2 * (v.x * vDot.x * y1 + v.y * vDot.y * y0) +
		(v.x * v.x * vy1 + v.y * v.y * vy0) +
		(vDot.x * v.y + v.x * vDot.y) * (x0 - x1) +
		v.x * v.y * (vx0 - vx1);
	const vxM = (V * UxDot - Ux * VDot) / V / V;
	const vyM = (V * UyDot - Uy * VDot) / V / V;
	const nDot = {
		x: vx0 - vxM,
		y: vy0 - vyM,
	};
	return (n.x * nDot.x + n.y * nDot.y) / n.len;
}

function calcCollisionForce(rod, pointIndex, isMidpoint = false) {
	const { points, collisionK: D, pointRodBeta: beta } = state;
	const point = points[pointIndex];
	const { point1, point2 } = rod;
	let { x: x0, y: y0, m, size: pointSize } = point;
	if (point === points[point1] || point === points[point2]) return;
	let { x: x1, y: y1, m: m1, isFixed: isFixed1 } = points[point1];
	let { x: x2, y: y2, m: m2, isFixed: isFixed2 } = points[point2];
	if (isMidpoint) {
		if (!isFixed1) {
			const { xmid: xmid1, ymid: ymid1 } = points[point1];
			x1 = xmid1;
			y1 = ymid1;
		}
		if (!isFixed2) {
			const { xmid: xmid2, ymid: ymid2 } = points[point2];
			x2 = xmid2;
			y2 = ymid2;
		}
		const { xmid: xmid0, ymid: ymid0, vxmid: vx0mid, vymid: vy0mid } = point;
		x0 = xmid0;
		y0 = ymid0;
	}
	const v = {
		x: x2 - x1,
		y: y2 - y1,
		len: 0,
	};
	v.len = Math.sqrt(v.x * v.x + v.y * v.y);
	const yM =
		(v.x * v.x * y1 + v.y * v.y * y0 - v.x * v.y * (x1 - x0)) / (v.len * v.len);
	const xM =
		(v.x * v.x * x0 + v.y * v.y * x1 - v.x * v.y * (y1 - y0)) / (v.len * v.len);
	let lambda = v.y !== 0 ? (yM - y1) / v.y : (xM - x1) / v.x;
	if (lambda <= 0 || lambda >= 1) {
		if (rod.collisions && rod.collisions.length > 0) {
			const index = rod.collisions.findIndex(
				(col) => col.pointIndex === pointIndex
			);
			if (index > -1) rod.collisions.splice(index, 1);
		}
		return;
	}
	const n = {
		x: x0 - xM,
		y: y0 - yM,
	};
	const dist = Math.sqrt(n.x * n.x + n.y * n.y);
	n.len = dist;
	const r = pointSize / 2;
	if (dist >= r) {
		if (rod.collisions && rod.collisions.length > 0) {
			const index = rod.collisions.findIndex(
				(col) => col.pointIndex === pointIndex
			);
			if (index > -1) rod.collisions.splice(index, 1);
		}
		return;
	}
	const K = D * (r - dist) - beta * calcDistDot(rod, pointIndex, isMidpoint);
	const K1 =
		(K * Math.sqrt((x2 - xM) * (x2 - xM) + (y2 - yM) * (y2 - yM))) / v.len;
	const K2 = K - K1;
	const Kx = (K * n.x) / n.len;
	const Ky = (K * n.y) / n.len;
	const K1x = -(K1 * n.x) / n.len;
	const K1y = -(K1 * n.y) / n.len;
	const K2x = -(K2 * n.x) / n.len;
	const K2y = -(K2 * n.y) / n.len;
	const E = 0.5 * D * (r - dist) * (r - dist);
	const collision = {
		pointIndex,
		dist,
		K,
		Kx,
		Ky,
		K1x,
		K1y,
		K2x,
		K2y,
		E,
	};
	if (isMidpoint) {
		point.axmid += Kx / m;
		point.aymid += Ky / m;
		if (!isFixed1) {
			points[point1].axmid += K1x / m1;
			points[point1].aymid += K1y / m1;
		}
		if (!isFixed2) {
			points[point2].axmid += K2x / m2;
			points[point2].aymid += K2y / m2;
		}
	} else {
		point.ax += Kx / m;
		point.ay += Ky / m;
		if (!isFixed1) {
			points[point1].ax += K1x / m1;
			points[point1].ay += K1y / m1;
		}
		if (!isFixed2) {
			points[point2].ax += K2x / m2;
			points[point2].ay += K2y / m2;
		}
		if (!rod.collisions) {
			rod.collisions = [];
			rod.collisions.push(collision);
		} else {
			const index = rod.collisions.findIndex(
				(col) => col.pointIndex === pointIndex
			);
			if (index === -1) rod.collisions.push(collision);
			else {
				const col = rod.collisions[index];
				col.K = K;
				col.dist = dist;
				col.Kx = Kx;
				col.Ky = Ky;
				col.K1x = K1x;
				col.K1y = K1y;
				col.K2x = K2x;
				col.K2y = K2y;
				col.E = E;
			}
		}
	}
}

function calcCollForce(point1, point2, isMidpoint = false) {
	const beta = 10;
	const { points, collisionK: D } = state;
	let { collisions } = state;
	const pointOne = points[point1];
	const pointTwo = points[point2];
	const { isFixed: isFixed1 } = pointOne;
	const { isFixed: isFixed2 } = pointTwo;
	if (isFixed1 || isFixed2) return;
	let { x: x1, y: y1, vx: v1x, vy: v1y, size: size1, m: m1 } = pointOne;
	let { x: x2, y: y2, vx: v2x, vy: v2y, size: size2, m: m2 } = pointTwo;
	const r = (size1 + size2) / 2;
	if (isMidpoint) {
		x1 = pointOne.xmid;
		y1 = pointOne.ymid;
		x2 = pointTwo.xmid;
		y2 = pointTwo.ymid;
	}
	const v = {
		x: x2 - x1,
		y: y2 - y1,
	};
	v.len = Math.sqrt(v.x * v.x + v.y * v.y);
	if (v.len > r) {
		if (!collisions) return;
		const index = collisions.findIndex(
			(col) => col.point1 === point1 && col.point2 === point2
		);
		if (index === -1) return;
		collisions.splice(index, 1);
		return;
	}
	const vDot = {
		x: v2x - v1x,
		y: v2y - v1y,
	};
	const distDot = (vDot.x * v.x + vDot.y * v.y) / v.len;
	const K = D * (r - v.len) - beta * distDot;
	const Kx = (-K * v.x) / v.len;
	const Ky = (-K * v.y) / v.len;
	const E = 0.5 * D * (r - v.len) * (r - v.len);
	if (!collisions) {
		state.collisions = [];
		collisions = state.collisions;
	}
	const index = collisions.findIndex(
		(col) => col.point1 === point1 && col.point2 === point2
	);
	if (index === -1) {
		collisions.push({
			point1,
			point2,
			K,
			Kx,
			Ky,
			E,
		});
	} else {
		const col = collisions[index];
		col.K = K;
		col.Kx = Kx;
		col.Ky = Ky;
	}
	if (isMidpoint) {
		pointOne.axmid += Kx / m1;
		pointOne.aymid += Ky / m1;
		pointTwo.axmid -= Kx / m2;
		pointTwo.aymid -= Ky / m2;
	} else {
		pointOne.ax += Kx / m1;
		pointOne.ay += Ky / m1;
		pointTwo.ax -= Kx / m2;
		pointTwo.ay -= Ky / m2;
	}
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
		if (state.bodyRodCollisionsOn) {
			if (!points[i].isFixed) {
				for (let j = 0; j < rods.length; j++) {
					if (!rods[j].isSpring) calcCollisionForce(rods[j], i, isMidpoint);
				}
			}
		}
		if (state.collisionsOn && !points[i].isFixed) {
			for (let j = i + 1; j < points.length; j++) {
				if (!points[j].isFixed) calcCollForce(i, j, isMidpoint);
			}
		}
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
		state.t = t;
		stepEulerRichardson();
	}
	return state;
}

export function getState() {
	return JSON.parse(JSON.stringify(state));
}
