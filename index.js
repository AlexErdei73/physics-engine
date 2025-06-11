import { init, simulate } from "./simulation.js";

const initialState = {
	g: 0,
	scale: 0.01,
	dt: 1e-5,
	t: 0,
	animTime: 1 / 60,
	width: 600,
	height: 400,
	isTimeVisible: false,
	isGridVisible: true,
	points: [
		{
			x: 2,
			y: 2,
			m: 1e6,
			size: 0.2,
			isFixed: true,
		},
		{
			x: 2,
			y: 3,
			vx: 1,
			vy: 0,
			m: 1,
			size: 0.2,
			isFixed: false,
		},
		{
			x: 5,
			y: 0,
			m: 1e6,
			size: 0.2,
			isFixed: true,
		},
		{
			x: 5,
			y: 3,
			vx: 0,
			vy: 0,
			m: 1,
			size: 0.2,
			isFixed: false,
		},
	],
	rods: [
		{
			point1: 0,
			point2: 1,
			elast: 1e4,
			length: 1,
			isSpring: false,
		},
		{
			point1: 2,
			point2: 3,
			elast: 1,
			length: 2,
			size: 0.2,
			isSpring: true,
		},
	],
};
let state;

function scl(dist) {
	const { scale } = initialState;
	return Math.round(dist / scale);
}

function drawGrid(width, height, scale, ctx) {
	const nx = width / scale;
	const ny = height / scale;
	ctx.beginPath();
	ctx.strokeStyle = "darkgray";
	for (let i = 0; i <= nx; i++) {
		ctx.moveTo(i / scale, 0);
		ctx.lineTo(i / scale, height);
	}
	for (let i = 0; i <= ny; i++) {
		ctx.moveTo(0, i / scale);
		ctx.lineTo(width, i / scale);
	}
	ctx.stroke();
	ctx.strokeStyle = "black";
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

function drawRod(rod, state, ctx) {
	const { points } = state;
	const { point1: i1, point2: i2 } = rod;
	const { x: x1, y: y1 } = points[i1];
	const { x: x2, y: y2 } = points[i2];
	ctx.beginPath();
	ctx.moveTo(scl(x1), scl(y1));
	if (!rod.isSpring) {
		ctx.lineTo(scl(x2), scl(y2));
	} else {
		const v = [scl(x2) - scl(x1), scl(y2) - scl(y1)];
		const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
		const n = [
			(0.5 * scl(rod.size) * v[1]) / len,
			(-0.5 * scl(rod.size) * v[0]) / len,
		];
		v[0] /= 40;
		v[1] /= 40;
		let x = scl(x1);
		let y = scl(y1);
		for (let i = 0; i < 10; i++) {
			x += v[0] + n[0];
			y += v[1] + n[1];
			ctx.lineTo(Math.round(x), Math.round(y));
			x += 2 * v[0] - 2 * n[0];
			y += 2 * v[1] - 2 * n[1];
			ctx.lineTo(Math.round(x), Math.round(y));
			x += v[0] + n[0];
			y += v[1] + n[1];
			ctx.lineTo(Math.round(x), Math.round(y));
		}
	}
	ctx.stroke();
}

function drawState(state, ctx) {
	const { points, rods } = state;
	for (let i = 0; i < points.length; i++) {
		drawPoint(points[i], ctx);
	}
	for (let i = 0; i < rods.length; i++) {
		drawRod(rods[i], state, ctx);
	}
}

function copySimParams(state) {
	state.scale = initialState.scale;
	state.isGridVisible = initialState.isGridVisible;
	state.isTimeVisible = initialState.isTimeVisible;
}

function draw(animate = true) {
	const canvas = document.querySelector("canvas");
	if (canvas.getContext) {
		const ctx = canvas.getContext("2d");
		if (animate) {
			state = simulate();
		} else if (!state) state = initialState;
		copySimParams(state);
		const { width, height, scale, isGridVisible, isTimeVisible } = state;
		ctx.clearRect(0, 0, width, height);
		if (isGridVisible) drawGrid(width, height, scale, ctx);
		if (isTimeVisible) ctx.fillText(Number(state.t).toFixed(3), 20, 20);
		drawState(state, ctx);
	}

	if (animate) raf = window.requestAnimationFrame(draw);
}

init(initialState);
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const resetBtn = document.querySelector("#reset");
const zoomInBtn = document.querySelector("#zoom-in");
const zoomOutBtn = document.querySelector("#zoom-out");

const gridChkBox = document.querySelector("#grid");
const timeChkBox = document.querySelector("#time");

let raf;

window.addEventListener("load", draw(false));

startBtn.addEventListener("click", () => {
	if (!raf) raf = window.requestAnimationFrame(draw);
});
stopBtn.addEventListener("click", () => {
	window.cancelAnimationFrame(raf);
	raf = false;
});
resetBtn.addEventListener("click", () => {
	init(initialState);
	raf = false;
	state = null;
	draw(false);
});
zoomInBtn.addEventListener("click", () => {
	initialState.scale /= 1.2;
	draw(false);
});
zoomOutBtn.addEventListener("click", () => {
	initialState.scale *= 1.2;
	draw(false);
});

gridChkBox.checked = initialState.isGridVisible;
timeChkBox.checked = initialState.isTimeVisible;

gridChkBox.addEventListener("change", () => {
	initialState.isGridVisible = gridChkBox.checked;
	draw(false);
});
timeChkBox.addEventListener("change", () => {
	initialState.isTimeVisible = timeChkBox.checked;
	draw(false);
});
