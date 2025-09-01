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
  if (pointIndex === point1 || pointIndex === point2) return;
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
    const { xmid: xmid0, ymid: ymid0 } = point;
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
  const N = D * (r - dist) - beta * calcDistDot(rod, pointIndex, isMidpoint);
  const N2 = lambda * N;
  const N1 = N - N2;
  const Nx = (N * n.x) / n.len;
  const Ny = (N * n.y) / n.len;
  const N1x = -(N1 * n.x) / n.len;
  const N1y = -(N1 * n.y) / n.len;
  const N2x = -(N2 * n.x) / n.len;
  const N2y = -(N2 * n.y) / n.len;
  const E = 0.5 * D * (r - dist) * (r - dist);
  const collision = {
    pointIndex,
    dist,
    N,
    Nx,
    Ny,
    N1x,
    N1y,
    N2x,
    N2y,
    E,
  };
  if (isMidpoint) {
    point.axmid += Nx / m;
    point.aymid += Ny / m;
    if (!isFixed1) {
      points[point1].axmid += N1x / m1;
      points[point1].aymid += N1y / m1;
    }
    if (!isFixed2) {
      points[point2].axmid += N2x / m2;
      points[point2].aymid += N2y / m2;
    }
  } else {
    point.ax += Nx / m;
    point.ay += Ny / m;
    if (!isFixed1) {
      points[point1].ax += N1x / m1;
      points[point1].ay += N1y / m1;
    }
    if (!isFixed2) {
      points[point2].ax += N2x / m2;
      points[point2].ay += N2y / m2;
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
        col.N = N;
        col.dist = dist;
        col.Nx = Nx;
        col.Ny = Ny;
        col.N1x = N1x;
        col.N1y = N1y;
        col.N2x = N2x;
        col.N2y = N2y;
        col.E = E;
      }
    }
  }
}

function calcCollForce(point1, point2, isMidpoint = false) {
  const { points, collisionK: D, pointPointBeta: beta } = state;
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
  const N = D * (r - v.len) - beta * distDot;
  const Nx = (-N * v.x) / v.len;
  const Ny = (-N * v.y) / v.len;
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
      N,
      Nx,
      Ny,
      E,
      dist: v.len,
    });
  } else {
    const col = collisions[index];
    col.N = N;
    col.Nx = Nx;
    col.Ny = Ny;
  }
  if (isMidpoint) {
    pointOne.axmid += Nx / m1;
    pointOne.aymid += Ny / m1;
    pointTwo.axmid -= Nx / m2;
    pointTwo.aymid -= Ny / m2;
  } else {
    pointOne.ax += Nx / m1;
    pointOne.ay += Ny / m1;
    pointTwo.ax -= Nx / m2;
    pointTwo.ay -= Ny / m2;
  }
}

function calcFrictionForce(state, collIndex, isMidpoint = false) {
  const STICK_TRESHOLD = 1e-5;
  const { points, collisions, pointMu: mu } = state;
  if (!mu) return;
  const collision = collisions[collIndex];
  const { point1, point2, N, Nx, Ny } = collision;
  const pointOne = points[point1];
  const pointTwo = points[point2];
  const n = {
    x: Nx / N,
    y: Ny / N,
  };
  const t = {
    x: n.y,
    y: -n.x,
  };
  let { m: m1, vx: v1x, vy: v1y, ax: a1x, ay: a1y } = pointOne;
  let { m: m2, vx: v2x, vy: v2y, ax: a2x, ay: a2y } = pointTwo;
  if (isMidpoint) {
    v1x = pointOne.vxmid;
    v1y = pointOne.vymid;
    v2x = pointTwo.vxmid;
    v2y = pointTwo.vymid;
    a1x = pointOne.axmid;
    a1y = pointOne.aymid;
    a2x = pointTwo.axmid;
    a2y = pointTwo.aymid;
  }
  const vRel = {
    x: v2x - v1x,
    y: v2y - v1y,
  };
  const vRelT = vRel.x * t.x + vRel.y * t.y;
  const sign = vRelT / Math.abs(vRelT);
  let Ffr = sign * mu * N;
  if (Math.abs(vRelT) < STICK_TRESHOLD) {
    const aRel = {
      x: a2x - a1x,
      y: a2y - a1y,
    };
    const aRelT = aRel.x * t.x + aRel.y * t.y;
    const M = (m1 * m2) / (m1 + m2);
    if (M * Math.abs(aRelT) < Math.abs(Ffr)) {
      Ffr = M * aRelT;
    }
  }
  collision.Ffr = Math.abs(Ffr);
  collision.Ffrx = Ffr * t.x;
  collision.Ffry = Ffr * t.y;
  const { Ffrx, Ffry } = collision;
  if (isMidpoint) {
    pointOne.axmid += Ffrx / m1;
    pointOne.aymid += Ffry / m1;
    pointTwo.axmid -= Ffrx / m2;
    pointTwo.aymid -= Ffry / m2;
  } else {
    pointOne.ax += Ffrx / m1;
    pointOne.ay += Ffry / m1;
    pointTwo.ax -= Ffrx / m2;
    pointTwo.ay -= Ffry / m2;
  }
}

function calcFrictionForceForRod(
  state,
  rodIndex,
  collIndex,
  isMidpoint = false
) {
  const STICK_TRESHOLD = 1e-4;
  const { points, rods, rodMu: mu } = state;
  if (!mu) return;
  const rod = rods[rodIndex];
  const { point1, point2, collisions } = rod;
  const collision = collisions[collIndex];
  const { N, Nx, Ny, N2x, N2y, pointIndex } = collision;
  const pointOne = points[point1];
  const pointTwo = points[point2];
  const point = points[pointIndex];
  const n = {
    x: Nx / N,
    y: Ny / N,
  };
  const t = {
    x: n.y,
    y: -n.x || 0,
  };
  const N2 = Math.sqrt(N2x * N2x + N2y * N2y);
  const lambda = N2 / N;
  let { m: m1, vx: v1x, vy: v1y, ax: a1x, ay: a1y } = pointOne;
  let { m: m2, vx: v2x, vy: v2y, ax: a2x, ay: a2y } = pointTwo;
  let { m, vx, vy, ax, ay } = point;
  if (isMidpoint) {
    v1x = pointOne.vxmid;
    v1y = pointOne.vymid;
    v2x = pointTwo.vxmid;
    v2y = pointTwo.vymid;
    vx = point.vxmid;
    vy = point.vymid;
    a1x = pointOne.axmid;
    a1y = pointOne.aymid;
    a2x = pointTwo.axmid;
    a2y = pointTwo.aymid;
    ax = point.axmid;
    ay = point.aymid;
  }
  v1x = v1x || 0;
  v1y = v1y || 0;
  v2x = v2x || 0;
  v2y = v2y || 0;
  vx = vx || 0;
  vy = vy || 0;
  a1x = a1x || 0;
  a1y = a1y || 0;
  a2x = a2x || 0;
  a2y = a2y || 0;
  ax = ax || 0;
  ay = ay || 0;
  m1 = m1 || Infinity;
  m2 = m2 || Infinity;
  const vRod = {
    x: (1 - lambda) * v1x + lambda * v2x,
    y: (1 - lambda) * v1y + lambda * v2y,
  };
  const vRel = {
    x: vx - vRod.x,
    y: vy - vRod.y,
  };
  const vRelT = vRel.x * t.x + vRel.y * t.y;
  const sign = vRelT / Math.abs(vRelT) || 0;
  let Ffr = -sign * mu * N;
  if (Math.abs(vRelT) < STICK_TRESHOLD) {
    const aRod = {
      x: (1 - lambda) * a1x + lambda * a2x,
      y: (1 - lambda) * a1y + lambda * a2y,
    };
    const aRel = {
      x: ax - aRod.x,
      y: ay - aRod.y,
    };
    const aRelT = aRel.x * t.x + aRel.y * t.y;
    const M =
      1 / (1 / m + ((1 - lambda) * (1 - lambda)) / m1 + (lambda * lambda) / m2);
    if (M * Math.abs(aRelT) < Math.abs(Ffr)) {
      Ffr = -M * aRelT;
    }
  }
  collision.Ffr = Math.abs(Ffr);
  collision.Ffrx = Ffr * t.x;
  collision.Ffry = Ffr * t.y;
  const { Ffrx, Ffry } = collision;
  collision.Ffr1x = (1 - lambda) * Ffr * t.x;
  collision.Ffr1y = (1 - lambda) * Ffr * t.y;
  collision.Ffr2x = lambda * Ffr * t.x;
  collision.Ffr2y = lambda * Ffr * t.y;
  const { Ffr1x, Ffr1y, Ffr2x, Ffr2y } = collision;
  if (isMidpoint) {
    point.axmid += Ffrx / m;
    point.aymid += Ffry / m;
    pointTwo.axmid -= Ffr2x / m2;
    pointTwo.aymid -= Ffr2y / m2;
    pointOne.axmid -= Ffr1x / m1;
    pointOne.aymid -= Ffr1y / m1;
  } else {
    point.ax += Ffrx / m;
    point.ay += Ffry / m;
    pointOne.ax -= Ffr1x / m1;
    pointOne.ay -= Ffr1y / m1;
    pointTwo.ax -= Ffr2x / m2;
    pointTwo.ay -= Ffr2y / m2;
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
  const { points, rods, collisions } = state;

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

  const rodsLen = rods.length;
  for (let i = 0; i < rodsLen; i++) {
    const collisions = rods[i].collisions;
    const len = collisions ? collisions.length : 0;
    for (let j = 0; j < len; j++) {
      calcFrictionForceForRod(state, i, j, isMidpoint);
    }
  }

  const len = collisions ? collisions.length : 0;
  for (let i = 0; i < len; i++) {
    calcFrictionForce(state, i, isMidpoint);
  }
}

function stepEulerRichardson() {
  const { points, dt, t } = state;
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
