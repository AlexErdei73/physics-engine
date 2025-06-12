import { init, simulate } from "./simulation.js";

const initialState = {
  g: 0,
  scale: 0.01,
  dt: 1e-5,
  t: 0,
  animTime: 1 / 30,
  width: 600,
  height: 400,
  isTimeVisible: false,
  isGridVisible: true,
  isForcesVisible: false,
  isEnergyVisible: true,
  points: [
    {
      x: 2,
      y: 2,
      size: 0.2,
      isFixed: true,
    },
    {
      x: 2,
      y: 1,
      vx: -1,
      vy: 0,
      m: 1,
      size: 0.2,
      isFixed: false,
    },
    {
      x: 5,
      y: 0,
      size: 0.2,
      isFixed: true,
    },
    {
      x: 5,
      y: 1,
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
      elast: 1e5,
      beta: 0.1,
      length: 1,
      isSpring: false,
    },
    {
      point1: 2,
      point2: 3,
      elast: 1,
      beta: 0,
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
  const x1px = scl(x1);
  const x2px = scl(x2);
  const y1px = scl(y1);
  const y2px = scl(y2);
  ctx.beginPath();
  ctx.moveTo(x1px, y1px);
  if (!rod.isSpring) {
    ctx.lineTo(x2px, y2px);
  } else {
    const r = 0.5 * scl(rod.size);
    const v = [x2px - x1px, y2px - y1px];
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    const n = [(r * v[1]) / len, (-r * v[0]) / len];
    v[0] /= 40;
    v[1] /= 40;
    let x = x1px;
    let y = y1px;
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

function drawVector(vector, point, ctx) {
  const ARROW_SIZE = 10;
  const x0 = scl(point.x);
  const y0 = scl(point.y);
  const vx = scl(vector[0]);
  const vy = scl(vector[1]);
  const x1 = x0 + vx;
  const y1 = y0 + vy;
  const v = Math.sqrt(vx * vx + vy * vy);
  const nx = vy / v;
  const ny = -vx / v;
  const x2 = x1 - (vx / v) * ARROW_SIZE + nx * 0.25 * ARROW_SIZE;
  const y2 = y1 - (vy / v) * ARROW_SIZE + ny * 0.25 * ARROW_SIZE;
  const x3 = x2 - nx * 0.5 * ARROW_SIZE;
  const y3 = y2 - ny * 0.5 * ARROW_SIZE;
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.moveTo(Math.round(x0), Math.round(y0));
  ctx.lineTo(Math.round(x1), Math.round(y1));
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = "blue";
  ctx.moveTo(Math.round(x1), Math.round(y1));
  ctx.lineTo(Math.round(x2), Math.round(y2));
  ctx.lineTo(Math.round(x3), Math.round(y3));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
}

function drawForces(state, ctx) {
  const { g, points, rods } = state;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const { m } = point;
    drawVector([0, m * g], point, ctx);
  }

  for (let i = 0; i < rods.length; i++) {
    const rod = rods[i];
    const { point1, point2, Fx, Fy } = rod;
    drawVector([Fx, Fy], points[point1], ctx);
    drawVector([-Fx, -Fy], points[point2], ctx);
  }
}

function copySimParams(state) {
  state.scale = initialState.scale;
  state.isGridVisible = initialState.isGridVisible;
  state.isTimeVisible = initialState.isTimeVisible;
  state.isForcesVisible = initialState.isForcesVisible;
  state.isEnergyVisible = initialState.isEnergyVisible;
}

function calcEnergy(state) {
  let Ekin = 0;
  let Egrav = 0;
  let Eelastic = 0;

  const { g, points, rods } = state;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point.isFixed) {
      const { m, y, vx, vy } = point;
      Egrav += -m * g * y;
      Ekin += 0.5 * m * (vx * vx + vy * vy);
    }
  }

  for (let i = 0; i < rods.length; i++) {
    const rod = rods[i];
    const { point1, point2, elast: D, length: l0 } = rod;
    const { x: x1, y: y1 } = points[point1];
    const { x: x2, y: y2 } = points[point2];
    const l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    Eelastic += 0.5 * D * (l - l0) * (l - l0);
  }
  return {
    kinetic: Ekin,
    gravity: Egrav,
    elastic: Eelastic,
    potential: Egrav + Eelastic,
    total: Ekin + Egrav + Eelastic,
  };
}

function draw(animate = true) {
  const canvas = document.querySelector("canvas");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");
    if (animate) {
      state = simulate();
    } else if (!state) state = initialState;
    copySimParams(state);
    const {
      width,
      height,
      scale,
      isGridVisible,
      isTimeVisible,
      isForcesVisible,
      isEnergyVisible,
    } = state;
    ctx.clearRect(0, 0, width, height);
    if (isGridVisible) drawGrid(width, height, scale, ctx);
    if (isTimeVisible) ctx.fillText(Number(state.t).toFixed(3), 20, 20);
    if (isEnergyVisible) {
      const energy = calcEnergy(state);
      const { kinetic, potential, total } = energy;
      ctx.fillStyle = "green";
      ctx.fillText(`kinetic: ${Number(kinetic).toFixed(3)}`, 20, 40);
      ctx.fillStyle = "red";
      ctx.fillText(`potential: ${Number(potential).toFixed(3)}`, 20, 60);
      ctx.fillStyle = "black";
      ctx.fillText(`total: ${Number(total).toFixed(3)}`, 20, 80);
    }
    drawState(state, ctx);
    if (isForcesVisible) drawForces(state, ctx);
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
const forceChkBox = document.querySelector("#force");
const energyChkBox = document.querySelector("#energy");

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
forceChkBox.checked = initialState.isForcesVisible;
energyChkBox.checked = initialState.isEnergyVisible;

gridChkBox.addEventListener("change", () => {
  initialState.isGridVisible = gridChkBox.checked;
  draw(false);
});
timeChkBox.addEventListener("change", () => {
  initialState.isTimeVisible = timeChkBox.checked;
  draw(false);
});
forceChkBox.addEventListener("change", () => {
  initialState.isForcesVisible = forceChkBox.checked;
  draw(false);
});
energyChkBox.addEventListener("change", () => {
  initialState.isEnergyVisible = energyChkBox.checked;
  draw(false);
});
