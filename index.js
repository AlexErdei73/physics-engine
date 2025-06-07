console.log("JS has started!");

const initialState = {
	g: 9.8,
	scale: 0.01,
	dt: 1e-5,
	animTime: 1 / 60,
	points: [
		{
			x: 3,
			y: 1,
			m: 1,
			size: 0.2,
			isFixed: true,
		},
		{
			x: 3,
			y: 2,
			m: 1e6,
			size: 0.2,
			isFixed: false,
		},
	],
	rods: [
		{
			point1: 0,
			point2: 1,
			flexibility: 1e6,
			length: 1,
		},
	],
};

const { g, scale, dt, animTime, points, rods } = initialState;

function scl(dist) {
	return Math.round(dist / scale);
}

function drawPoint(point, ctx) {
	ctx.beginPath();
	const { x, y, size, isFixed } = point;
	if (isFixed) {
		const y1 = scl(y - size / 2);
		const y2 = scl(y + size / 2);
		ctx.moveTo(scl(x), y1);
		ctx.lineTo(scl(x), y2);
		const x1 = scl(x - size / 2);
		const x2 = scl(x + size / 2);
		ctx.moveTo(x1, scl(y));
		ctx.lineTo(x2, scl(y));
	} else {
		const r = scl(size / 2);
		ctx.moveTo(scl(x) + r, scl(y));
		ctx.arc(scl(x), scl(y), r, 0, Math.PI * 2, true);
	}
	ctx.stroke();
}

function drawRod(rod, ctx) {
	const { points } = initialState;
	const { point1: i1, point2: i2 } = rod;
	const { x: x1, y: y1 } = points[i1];
	const { x: x2, y: y2 } = points[i2];
	ctx.beginPath();
	ctx.moveTo(scl(x1), scl(y1));
	ctx.lineTo(scl(x2), scl(y2));
	ctx.stroke();
}

function draw() {
	const canvas = document.querySelector("canvas");
	if (canvas.getContext) {
		const ctx = canvas.getContext("2d");

		const { points, rods } = initialState;
		for (let i = 0; i < points.length; i++) {
			drawPoint(points[i], ctx);
		}
		for (let i = 0; i < rods.length; i++) {
			drawRod(rods[i], ctx);
		}
	}
}

window.addEventListener("load", draw);
