import { simulate, init } from "./simulation.js";

let initialState;
let raf;

let trajectories = [];
let pointWithVisiblePathIndexes = [];

let graphs;
let graphDetails = [];
const MAX_NUMBER_OF_GRAPHS = 4;

export function start() {
  if (!raf) raf = window.requestAnimationFrame(draw);
}

export function stop() {
  window.cancelAnimationFrame(raf);
  raf = false;
}

export function reset(canvas) {
  init(initialState);
  raf = false;
  state = null;
  trajectories = [];
  pointWithVisiblePathIndexes = [];
  graphs = [[], [], [], []];
  !canvas ? draw(false) : draw(false, canvas);
}

export function zoom(isIn) {
  if (isIn) initialState.scale /= 1.2;
  else initialState.scale *= 1.2;
  setInitialState(initialState);
  draw(false);
}

export function setInitialState(initState) {
  initialState = initState;
}

export function setGraphDetails(graphDet) {
  const len = graphDetails.length;
  if (len < MAX_NUMBER_OF_GRAPHS) graphDetails.push(graphDet);
}

export function removeGraphDetails(index) {
  graphDetails.splice(index, 1);
}

let state;
let context;

function scl(dist) {
  const { scale } = initialState;
  return Math.round(dist / scale);
}

function drawGrid(
  width,
  height,
  scale,
  ctx,
  isGraph = false,
  isOriginCenter = true
) {
  const nx = width * scale;
  const ny = height * scale;
  ctx.beginPath();
  ctx.strokeStyle = "darkgray";
  for (let i = 0; i <= nx; i++) {
    ctx.moveTo(i / scale, 0);
    ctx.lineTo(i / scale, height);
  }
  for (let i = 0; i <= ny; i++) {
    const shift = Math.floor(ny / 2);
    let y = i / scale;
    if (isGraph && isOriginCenter) y -= shift / scale;
    if (isGraph) y = height - y;
    if (isGraph && isOriginCenter) y -= Math.floor(height / 2);
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.strokeStyle = "black";
  if (isGraph && isOriginCenter) {
    ctx.beginPath();
    const halfHeight = Math.floor(height / 2);
    ctx.moveTo(0, halfHeight);
    ctx.lineTo(width, halfHeight);
    ctx.stroke();
  }
}

function drawPoint(point, ctx, color = "black", lineWidth = 1) {
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
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
}

function drawRod(rod, state, ctx, color = "black", lineWidth = 1) {
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
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
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

export function removeSelection() {
  if (!context) return;
  draw(false);
}

export function select(option, index) {
  if (!context) return;
  if (option === "points") {
    const point = state.points[index];
    drawPoint(point, context, "red", 2);
  } else if (option === "rods") {
    const rod = state.rods[index];
    drawRod(rod, state, context, "red", 2);
  }
}

function drawVector(vector, point, ctx, color = "blue") {
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
  ctx.strokeStyle = color;
  ctx.moveTo(Math.round(x0), Math.round(y0));
  ctx.lineTo(Math.round(x1), Math.round(y1));
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(Math.round(x1), Math.round(y1));
  ctx.lineTo(Math.round(x2), Math.round(y2));
  ctx.lineTo(Math.round(x3), Math.round(y3));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.fillStyle = "black";
}

function drawForces(state, ctx) {
  const { g, points, rods, collisions } = state;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const { m } = point;
    drawVector([0, m * g], point, ctx);
    if (collisions && collisions.length > 0) {
      collisions
        .filter((col) => col.point1 === i)
        .forEach((col) => {
          const { Nx, Ny, point2, Ffrx, Ffry } = col;
          const otherPoint = points[point2];
          drawVector([Nx, Ny], point, ctx);
          drawVector([-Nx, -Ny], otherPoint, ctx);
          drawVector([Ffrx, Ffry], point, ctx);
          drawVector([-Ffrx, -Ffry], otherPoint, ctx);
        });
    }
  }

  for (let i = 0; i < rods.length; i++) {
    const rod = rods[i];
    const { point1, point2, Fx, Fy, collisions } = rod;
    drawVector([Fx, Fy], points[point1], ctx);
    drawVector([-Fx, -Fy], points[point2], ctx);
    if (collisions && collisions.length > 0) {
      let N1xSum = 0;
      let N1ySum = 0;
      let N2xSum = 0;
      let N2ySum = 0;
      collisions.forEach((col) => {
        const { pointIndex, Nx, Ny, N1x, N1y, N2x, N2y } = col;
        drawVector([Nx, Ny], points[pointIndex], ctx);
        N1xSum += N1x;
        N1ySum += N1y;
        N2xSum += N2x;
        N2ySum += N2y;
      });
      drawVector([N1xSum, N1ySum], points[point1], ctx);
      drawVector([N2xSum, N2ySum], points[point2], ctx);
    }
  }
}

function drawPeriodicExtForce(state, ctx) {
  const { periodicExtForce, points } = state;
  if (!periodicExtForce) return;
  const { Fx, Fy, point: i, isOn } = periodicExtForce;
  const point = points[i];
  if (!isOn) return;
  drawVector([Fx, Fy], point, ctx, "red");
}

function drawTrajectories(state, ctx) {
  const { points, isPathsVisible } = state;
  let len = trajectories.length;
  if (len === 0) {
    for (let i = 0; i < points.length; i++) {
      if (points[i].isPathVisible) {
        trajectories.push([]);
        pointWithVisiblePathIndexes.push(i);
        len++;
      }
    }
  }
  ctx.beginPath();
  ctx.strokeStyle = "green";
  const positions = pointWithVisiblePathIndexes.map((i) => {
    return { x: points[i].x, y: points[i].y };
  });
  for (let i = 0; i < len; i++) {
    trajectories[i].push(positions[i]);
    const { x, y } = trajectories[i][0];
    if (isPathsVisible) {
      ctx.moveTo(scl(x), scl(y));
      for (let j = 1; j < trajectories[i].length; j++) {
        const { x, y } = trajectories[i][j];
        ctx.lineTo(scl(x), scl(y));
      }
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "black";
}

function copySimParams(state) {
  state.scale = initialState.scale;
  state.isGridVisible = initialState.isGridVisible;
  state.isTimeVisible = initialState.isTimeVisible;
  state.isForcesVisible = initialState.isForcesVisible;
  state.isEnergyVisible = initialState.isEnergyVisible;
  state.isPathsVisible = initialState.isPathsVisible;
  state.isGraphsVisible = initialState.isGraphsVisible;
  const extForce = initialState.periodicExtForce;
  if (extForce && extForce.isOn) state.periodicExtForce.omega = extForce.omega;
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
    if (rod.collisions) {
      rod.collisions.forEach((col) => {
        Eelastic += col.E;
      });
    }
  }
  if (state.collisions) {
    state.collisions.forEach((col) => {
      Eelastic += col.E;
    });
  }
  return {
    kinetic: Ekin,
    gravity: Egrav,
    elastic: Eelastic,
    potential: Egrav + Eelastic,
    total: Ekin + Egrav + Eelastic,
  };
}

function showFreq(ctx, periodicExtForce, t, yPos) {
  if (!periodicExtForce) return;
  const { omega, isOn, tMin, tMax } = periodicExtForce;
  if (isOn && t >= tMin && t <= tMax) {
    ctx.fillStyle = "red";
    ctx.fillText(`freq: ${Number(omega / 2 / Math.PI).toFixed(3)}`, 20, yPos);
    ctx.fillStyle = "black";
  }
}

function addGraphPoint(state, i) {
  if (graphDetails.length === 0 || i < 0 || i >= graphDetails.length) return;
  const x = state.t;
  const { option, index, field, pointIndex } = graphDetails[i];
  let y = index === -1 ? state[option][field] : state[option][index][field];
  if (option === "rods") {
    const { points, rods } = state;
    const rod = rods[index];
    if (field === "l") {
      const { point1, point2 } = rod;
      const { x: x1, y: y1 } = points[point1];
      const { x: x2, y: y2 } = points[point2];
      const l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      y = l;
    } else if (field === "F") {
      const { Fx, Fy } = rod;
      const F = Math.sqrt(Fx * Fx + Fy * Fy);
      y = F;
    } else {
      const { collisions } = rod;
      const collIndex = collisions
        ? collisions.findIndex((col) => col.pointIndex === pointIndex)
        : -1;
      if (collIndex === -1) y = 0;
      else if (field === "N") y = collisions[collIndex][field];
      else if (field === "N1") {
        const { N1x, N1y } = collisions[collIndex];
        y = Math.sqrt(N1x * N1x + N1y * N1y);
      } else if (field === "N2") {
        const { N2x, N2y } = collisions[collIndex];
        y = Math.sqrt(N2x * N2x + N2y * N2y);
      }
    }
  } else if (option === "points") {
    if (field === "N" || field === "Ffr") {
      const { collisions } = state;
      const collIndex = collisions
        ? collisions.findIndex(
            (col) =>
              (col.point1 === index && col.point2 === pointIndex) ||
              (col.point1 === pointIndex && col.point2 === index)
          )
        : -1;
      if (collIndex === -1) y = 0;
      else y = collisions[collIndex][field];
    }
  }
  graphs[i].push({ x, y });
}

function drawGraphs(graphs, state, ctx, isOriginCenter = false) {
  const colours = ["red", "green", "blue", "black"];
  if (graphDetails.length === 0) return;
  for (let i = 0; i < MAX_NUMBER_OF_GRAPHS; i++) {
    if (graphs[i].length === 0) return;
    const { x, y } = graphs[i][0];
    const { height } = state;
    const shift = isOriginCenter ? Math.floor(height / 2) : 0;
    ctx.strokeStyle = colours[i];
    ctx.beginPath();
    ctx.moveTo(scl(x), state.height - shift - scl(y));
    for (let j = 1; j < graphs[i].length; j++) {
      const { x, y } = graphs[i][j];

      ctx.lineTo(scl(x), state.height - shift - scl(y));
    }
    ctx.stroke();
    ctx.strokeStyle = "black";
  }
}

export function draw(animate = true, canvas) {
  if (!canvas) canvas = document.querySelector("canvas");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");
    if (!context) context = ctx;
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
      isGraphsVisible,
      periodicExtForce,
      t,
    } = state;
    ctx.clearRect(0, 0, width, height);
    if (!isGraphsVisible) {
      if (isGridVisible) drawGrid(width, height, scale, ctx);
      drawTrajectories(state, ctx);
      if (isTimeVisible) ctx.fillText(Number(t).toFixed(3), 20, 20);
      if (isEnergyVisible) {
        const energy = calcEnergy(state);
        const { kinetic, potential, total } = energy;
        ctx.fillStyle = "green";
        ctx.fillText(`kinetic: ${Number(kinetic).toFixed(3)}`, 20, 40);
        ctx.fillStyle = "blue";
        ctx.fillText(`potential: ${Number(potential).toFixed(3)}`, 20, 60);
        ctx.fillStyle = "black";
        ctx.fillText(`total: ${Number(total).toFixed(3)}`, 20, 80);
        showFreq(ctx, periodicExtForce, t, 100);
      } else {
        showFreq(ctx, periodicExtForce, t, 40);
      }
      drawState(state, ctx);
      drawPeriodicExtForce(state, ctx);
      if (isForcesVisible) drawForces(state, ctx);
    } else {
      let isOriginCentered = false;
      const len = graphDetails.length;
      if (len > 0) isOriginCentered = graphDetails[0].isOriginCentered;
      drawGrid(width, height, scale, ctx, true, isOriginCentered);
      for (let i = 0; i < len; i++) {
        addGraphPoint(state, i);
      }
      drawGraphs(graphs, state, ctx, isOriginCentered);
    }
  }

  if (animate) raf = window.requestAnimationFrame(draw);
}
