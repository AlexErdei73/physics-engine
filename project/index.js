import { fetchProjects } from "../backend.js";
import {
  draw,
  setInitialState,
  start,
  stop,
  reset,
  zoom,
  setGraphDetails,
  removeGraphDetails,
  select,
  removeSelection,
} from "./animation.js";
import { getState } from "./simulation.js";

const BASE_URL = "/physics-engine/";
const pageURL = window.location.href;

const emptyWorld = {
  name: "Empty World",
  description: "World for the physics-engine showing simulated animations",
  g: 0,
  scale: 0.01,
  dt: 1e-5,
  t: 0,
  animTime: 1 / 30,
  width: 600,
  height: 400,
  isTimeVisible: true,
  isGridVisible: true,
  isForcesVisible: false,
  isEnergyVisible: false,
  points: [],
  rods: [],
};

let projects = JSON.parse(localStorage.getItem("projects")) || [];

function getProjectIndex(url) {
  const array = url.split("#");
  const len = array.length;
  const index = +array[len - 1];
  return isNaN(index) ? projects.length - 1 : index;
}

function getProjectID(url) {
  const array = url.split("#");
  const len = array.length;
  const str = array[len - 1];
  return len > 1 && isNaN(str) ? str : null;
}

async function getPublicProjects() {
  await fetchProjects();
  projects = JSON.parse(localStorage.getItem("projects"));
}

let projectID = getProjectID(pageURL);
let projectIndex = getProjectIndex(pageURL);

async function getProjectIdx(projectID) {
  if (!projectID) return;
  let projectIndex = projects.findIndex((pr) => pr.projectID === projectID);
  if (projectIndex === -1) {
    await getPublicProjects();
    projectIndex = projects.findIndex((pr) => pr.projectID === projectID);
  }
  return projectIndex;
}

async function getInitialState() {
  const projectIdx = await getProjectIdx(projectID);
  projectIndex = projectIdx && projectIdx > -1 ? projectIdx : projectIndex;
  const initialState =
    projects.length > 0 && projectIndex < projects.length
      ? projects[projectIndex]
      : emptyWorld;
  initialState.isPathsVisible = true;
  setInitialState(initialState);
  return initialState;
}

let initialState;

async function initialize() {
  initialState = await getInitialState();
  reset();
  initResPeeking(getState());

  gridChkBox.checked = initialState.isGridVisible;
  timeChkBox.checked = initialState.isTimeVisible;
  forceChkBox.checked = initialState.isForcesVisible;
  energyChkBox.checked = initialState.isEnergyVisible;
  pathChkBox.checked = initialState.isPathsVisible;
  graphsChkBox.checked = false;
  resultsChkBox.checked = false;

  const aCreate = document.querySelector("#a-create");
  const aProject = document.querySelector("#a-project");
  aCreate.href = `${BASE_URL}create#${projectIndex}`;
  aProject.href = `${BASE_URL}project#${projectIndex}`;

  const rangeFreq = document.querySelector("#range-freq");
  const { periodicExtForce: extForce } = initialState;
  rangeFreq.disabled = !extForce || !extForce.isOn;
  rangeFreq.addEventListener("change", () => {
    const rangeValue = rangeFreq.value;
    const { freqMin, freqMax } = initialState.periodicExtForce;
    const f = freqMin + ((freqMax - freqMin) / 100) * rangeValue;
    extForce.omega = 2 * Math.PI * f;
    draw(false);
  });

  const canvas = document.querySelector("canvas");
  canvas.textContent = initialState.description;

  removeSelection();
}

initialize();

let graphDetails = [];
const MAX_NUMBER_OF_GRAPHS = 4;

const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const resetBtn = document.querySelector("#reset");
const zoomInBtn = document.querySelector("#zoom-in");
const zoomOutBtn = document.querySelector("#zoom-out");
const switchBackBtn = document.querySelector("#btn-switch-back");

const gridChkBox = document.querySelector("#grid");
const timeChkBox = document.querySelector("#time");
const forceChkBox = document.querySelector("#force");
const energyChkBox = document.querySelector("#energy");
const pathChkBox = document.querySelector("#path");
const graphsChkBox = document.querySelector("#graphs");
const resultsChkBox = document.querySelector("#results");

function handleShowResultsChange() {
  const divResPeeking = document.querySelector("#res-peeking");
  const divSimuRunning = document.querySelector("#sim-running");
  const checked = resultsChkBox.checked;
  if (checked) {
    divResPeeking.classList.remove("hidden");
    divSimuRunning.classList.add("hidden");
    initResPeeking(getState());
  } else {
    divResPeeking.classList.add("hidden");
    divSimuRunning.classList.remove("hidden");
  }
}

const selPointsOrRods = document.querySelector("#sel-points-or-rods");
const inpResIndex = document.querySelector("#inp-res-index");
const chkboxAddedToGraph = document.querySelector("#chkbox-added-to-graphs");
const chkboxOriginCenter = document.querySelector("#chkbox-origin-center");
let selField;
const selFieldPoint = document.querySelector("#sel-field-point");
const selFieldRod = document.querySelector("#sel-field-rod");
const selFieldPerExtForce = document.querySelector(
  "#sel-field-periodic-ext-force"
);
const labFieldPoint = document.querySelector("#lab-field-point");
const labFieldRod = document.querySelector("#lab-field-rod");
const labFieldPerExtForce = document.querySelector(
  "#lab-field-periodic-ext-force"
);
selField = selFieldPoint;

function pickSelField(option) {
  if (!labFieldPerExtForce.classList.contains("hidden"))
    labFieldPerExtForce.classList.add("hidden");
  if (!labFieldPoint.classList.contains("hidden"))
    labFieldPoint.classList.add("hidden");
  if (!labFieldRod.classList.contains("hidden"))
    labFieldRod.classList.add("hidden");
  if (option === "points") {
    labFieldPoint.classList.remove("hidden");
    selField = selFieldPoint;
  } else if (option === "rods") {
    labFieldRod.classList.remove("hidden");
    selField = selFieldRod;
  } else {
    labFieldPerExtForce.classList.remove("hidden");
    selField = selFieldPerExtForce;
  }
}

function areEqual(obj1, obj2) {
  let equal = true;
  for (let key in obj1) {
    if (obj1[key] !== obj2[key]) equal = false;
  }
  return equal;
}

function enableCheckboxAddedToGraphs() {
  let checked = false;
  for (let i = 0; i < graphDetails.length; i++) {
    if (
      areEqual(graphDetails[i], {
        option: selPointsOrRods.value,
        field: selField.value,
        index: +inpResIndex.value,
        isOriginCentered: chkboxOriginCenter.checked,
      }) ||
      areEqual(graphDetails[i], {
        option: selPointsOrRods.value,
        field: selField.value,
        index: +inpResIndex.value,
        isOriginCentered: chkboxOriginCenter.checked,
        pointIndex:
          selPointsOrRods.value === "points"
            ? +inpResPointCollPointIndex.value
            : +inpResRodCollPointIndex.value,
      })
    )
      checked = true;
  }

  chkboxAddedToGraph.checked = checked;
  const disabled = graphDetails.length === MAX_NUMBER_OF_GRAPHS && !checked;
  chkboxAddedToGraph.disabled = disabled;
}
selFieldPoint.addEventListener("change", enableCheckboxAddedToGraphs);
selFieldRod.addEventListener("change", enableCheckboxAddedToGraphs);
selFieldPerExtForce.addEventListener("change", enableCheckboxAddedToGraphs);

function handlePointsOrRodsChange() {
  const divResPoint = document.querySelector("#res-point");
  const divResRod = document.querySelector("#res-rod");
  const option = selPointsOrRods.value;
  pickSelField(option);
  enableCheckboxAddedToGraphs();
  removeSelection();
  if (option === "points") {
    divResPoint.classList.remove("hidden");
    if (!divResRod.classList.contains("hidden"))
      divResRod.classList.add("hidden");
    const len = initialState.points.length;
    inpResIndex.max = (len - 1).toString();
    if (len > 0) {
      inpResIndex.value = "0";
      if (!graphsChkBox.checked) select(option, 0);
      inpResIndex.min = "0";
    } else {
      inpResIndex.value = "-1";
      inpResIndex.min = "-1";
    }
  } else if (option === "rods") {
    if (!divResPoint.classList.contains("hidden"))
      divResPoint.classList.add("hidden");
    divResRod.classList.remove("hidden");
    const len = initialState.rods.length;
    inpResIndex.max = (len - 1).toString();
    if (len > 0) {
      inpResIndex.value = "0";
      if (!graphsChkBox.checked) select(option, 0);
      inpResIndex.min = "0";
    } else {
      inpResIndex.value = "-1";
      inpResIndex.min = "-1";
    }
  } else {
    if (!divResPoint.classList.contains("hidden"))
      divResPoint.classList.add("hidden");
    if (!divResRod.classList.contains("hidden"))
      divResRod.classList.add("hidden");
    inpResIndex.value = "-1";
    inpResIndex.min = "-1";
    inpResIndex.max = "-1";
  }
}
selPointsOrRods.addEventListener("change", handlePointsOrRodsChange);

function handleChangeChkboxOriginCenter() {
  if (graphDetails.length === 0) return;
  graphDetails[0].isOriginCentered = chkboxOriginCenter.checked;
}
chkboxOriginCenter.addEventListener("change", handleChangeChkboxOriginCenter);

function initResPeriodicExtForce(state) {
  const { periodicExtForce } = state;
  if (!periodicExtForce) return;
  const { isOn, F0x, F0y, omega, fix, fiy, Fx, Fy } = periodicExtForce;
  if (!isOn) return;
  const divF0x = document.querySelector("#res-F0x");
  const divF0y = document.querySelector("#res-F0y");
  const divOmega = document.querySelector("#res-omega");
  const divFix = document.querySelector("#res-fix");
  const divFiy = document.querySelector("#res-fiy");
  const divFx = document.querySelector("#res-Fx");
  const divFy = document.querySelector("#res-Fy");
  divF0x.textContent = `F0x: ${Number(F0x).toFixed(4)}`;
  divF0y.textContent = `F0y: ${Number(F0y).toFixed(4)}`;
  divOmega.textContent = `Omega: ${Number(omega).toFixed(4)}`;
  divFix.textContent = `fix: ${Number(fix).toFixed(4)}`;
  divFiy.textContent = `fiy: ${Number(fiy).toFixed(4)}`;
  divFx.textContent = `Fx: ${Number(Fx).toFixed(4)}`;
  divFy.textContent = `Fy: ${Number(Fy).toFixed(4)}`;
  const divResPeriodicExtForce = document.querySelector(
    "#res-periodic-ext-force"
  );
  divResPeriodicExtForce.classList.remove("hidden");
}

let currentRod = null;
function handlePointIndexChange(event, state = null) {
  const inpPointIndex = event.target;
  const id = inpPointIndex.id;
  let option = id.split("-")[1];
  if (option === "newton") option = "point";
  const forceType = id.split("-")[2];

  const divDist = document.querySelector(`#res-${option}-coll-dist`);
  const divN = document.querySelector(`#res-${option}-coll-N`);
  const divFfr = document.querySelector(`#res-${option}-coll-friction`);
  const divN1 = document.querySelector("#res-rod-coll-N1");
  const divN2 = document.querySelector("#res-rod-coll-N2");

  const divGravDist = document.querySelector("#res-newton-gravity-dist");
  const divGravForce = document.querySelector("#res-newton-gravity-force");
  const divGravForceX = document.querySelector("#res-newton-gravity-force-x");
  const divGravForceY = document.querySelector("#res-newton-gravity-force-y");

  const pointIndex = Number(inpPointIndex.value);

  const { collisions, newtonGravForces } =
    option === "rod" ? currentRod : state;
  let index = -1;
  let forces = forceType === "coll" ? collisions : newtonGravForces;
  if (forces && option === "point") {
    const currentPointIndex = +inpResIndex.value || 0;
    index = forces.findIndex(
      (force) =>
        (force.point1 === currentPointIndex && force.point2 === pointIndex) ||
        (force.point1 === pointIndex && force.point2 === currentPointIndex)
    );
  } else if (collisions && option === "rod" && forceType === "coll")
    index = collisions.findIndex((col) => col.pointIndex === pointIndex);
  if (index === -1) {
    if (forceType === "coll") {
      divDist.textContent = "dist:";
      divN.textContent = "N:";
      divFfr.textContent = "F friction:";
      if (option === "rod") {
        divN1.textContent = "N1:";
        divN2.textContent = "N2:";
      }
    } else {
      divGravDist.textContent = "dist:";
      divGravForce.textContent = "F grav:";
      divGravForceX.textContent = "F grav,x:";
      divGravForceY.textContent = "F grav,y:";
    }
  } else {
    if (forceType === "coll") {
      const { N, N1x, N1y, dist, Ffr } = collisions[index];
      divDist.textContent = `dist: ${Number(dist).toFixed(4)}`;
      divN.textContent = `N: ${Number(N).toFixed(4)}`;
      divFfr.textContent = `F friction: ${(Number(Ffr) || 0).toFixed(4)}`;
      if (option === "rod") {
        const N1 = Math.sqrt(N1x * N1x + N1y * N1y);
        const N2 = N - N1;
        divN1.textContent = `N1: ${Number(N1).toFixed(4)}`;
        divN2.textContent = `N2: ${Number(N2).toFixed(4)}`;
      }
    } else {
      const { Fgrx, Fgry, r12, Fgr } = newtonGravForces[index];
      divGravDist.textContent = `dist: ${Number(r12.len).toFixed(4)}`;
      divGravForce.textContent = `F grav: ${Number(Fgr).toExponential(4)}`;
      divGravForceX.textContent = `F grav,x: ${Number(Fgrx).toExponential(4)}`;
      divGravForceY.textContent = `F grav,y: ${Number(Fgry).toExponential(4)}`;
    }
  }
  enableCheckboxAddedToGraphs();
}
const inpResRodCollPointIndex = document.querySelector(
  "#res-rod-coll-point-index"
);
inpResRodCollPointIndex.addEventListener("change", handlePointIndexChange);
const inpResPointCollPointIndex = document.querySelector(
  "#res-point-coll-point-index"
);
inpResPointCollPointIndex.addEventListener("change", (event) =>
  handlePointIndexChange(event, getState())
);
const inpResNewtonGravityPointIndex = document.querySelector(
  "#res-newton-gravity-point-index"
);
inpResNewtonGravityPointIndex.addEventListener("change", (event) =>
  handlePointIndexChange(event, getState())
);

const chkboxResRodCollisions = document.querySelector(
  "#chkbox-res-rod-collisions"
);

const chkboxResPointCollisions = document.querySelector(
  "#chkbox-res-point-collisions"
);

const chkboxResPointNewtonGravity = document.querySelector(
  "#chkbox-res-point-newton-gravity"
);
function handleChkboxPointNewtonGravityChange(event) {
  const chkbox = event.target;
  const divResPointParams = document.querySelector("#res-point-params");
  const divResNewtonGravity = document.querySelector("#res-newton-gravity");
  if (chkbox.checked) {
    divResNewtonGravity.classList.remove("hidden");
    divResPointParams.classList.add("hidden");
  } else {
    divResNewtonGravity.classList.add("hidden");
    if (!chkboxResPointCollisions.checked)
      divResPointParams.classList.remove("hidden");
  }
}
chkboxResPointNewtonGravity.addEventListener(
  "change",
  handleChkboxPointNewtonGravityChange
);

function handleChkboxResCollChange(event) {
  const chkbox = event.target;
  const chkboxId = chkbox.id;
  const option = chkboxId.split("-")[2];
  const divResParams = document.querySelector(`#res-${option}-params`);
  const divResCollision = document.querySelector(`#res-${option}-collision`);
  if (chkbox.checked) {
    divResCollision.classList.remove("hidden");
    divResParams.classList.add("hidden");
  } else {
    divResCollision.classList.add("hidden");
    if (!chkboxResPointNewtonGravity.checked)
      divResParams.classList.remove("hidden");
  }
}
chkboxResRodCollisions.addEventListener("change", handleChkboxResCollChange);
chkboxResPointCollisions.addEventListener("change", handleChkboxResCollChange);

function initResPoint(state, index) {
  const { points, g, simulationType } = state;
  const point = points[index] || null;
  if (!point) return;

  chkboxResPointCollisions.checked = false;
  chkboxResPointNewtonGravity.checked = false;
  handleChkboxResCollChange({ target: chkboxResPointCollisions });
  handleChkboxPointNewtonGravityChange({ target: chkboxResPointNewtonGravity });

  inpResPointCollPointIndex.min = 0;
  inpResPointCollPointIndex.max = points.length - 1;
  inpResPointCollPointIndex.value = 0;
  handlePointIndexChange({ target: inpResPointCollPointIndex }, state);

  inpResNewtonGravityPointIndex.min = 0;
  inpResNewtonGravityPointIndex.max = points.length - 1;
  inpResNewtonGravityPointIndex.value = 0;
  handlePointIndexChange({ target: inpResNewtonGravityPointIndex }, state);

  const divResM = document.querySelector("#res-point-m");
  const divResGrav = document.querySelector("#res-point-grav");
  const divResX = document.querySelector("#res-point-x");
  const divResY = document.querySelector("#res-point-y");
  const divResVx = document.querySelector("#res-point-vx");
  const divResVy = document.querySelector("#res-point-vy");
  const divResAx = document.querySelector("#res-point-ax");
  const divResAy = document.querySelector("#res-point-ay");
  const { m, x, y, vx, vy, ax, ay } = point;
  divResM.textContent = `m: ${
    simulationType === "celestial"
      ? Number(m).toExponential(4)
      : Number(m).toFixed(4)
  }`;
  divResGrav.textContent = `m*g: ${Number(m * g).toFixed(4)}`;
  divResX.textContent = `x: ${Number(x).toFixed(4)}`;
  divResY.textContent = `y: ${Number(y).toFixed(4)}`;
  divResVx.textContent = `vx: ${Number(vx).toFixed(4)}`;
  divResVy.textContent = `vy: ${Number(vy).toFixed(4)}`;
  divResAx.textContent = `ax: ${Number(ax).toFixed(4)}`;
  divResAy.textContent = `ay: ${Number(ay).toFixed(4)}`;
}

function initResRod(state, index) {
  const { points, rods } = state;
  const rod = rods[index] || null;
  if (!rod) return;
  currentRod = rod;
  const { point1, point2, elast: k, beta, length: l0, Fx, Fy } = rods[index];
  const { x: x1, y: y1 } = points[point1];
  const { x: x2, y: y2 } = points[point2];
  const l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

  chkboxResRodCollisions.checked = false;
  handleChkboxResCollChange({ target: chkboxResRodCollisions });

  inpResRodCollPointIndex.min = 0;
  inpResRodCollPointIndex.max = points.length - 1;
  inpResRodCollPointIndex.value = 0;
  handlePointIndexChange({ target: inpResRodCollPointIndex });

  const divResK = document.querySelector("#res-rod-k");
  const divResL0 = document.querySelector("#res-rod-l0");
  const divResBeta = document.querySelector("#res-rod-beta");
  const divResL = document.querySelector("#res-rod-l");
  const divResF = document.querySelector("#res-rod-F");
  const divResFx = document.querySelector("#res-rod-Fx");
  const divResFy = document.querySelector("#res-rod-Fy");
  divResK.textContent = `k: ${Number(k).toFixed(4)}`;
  divResL0.textContent = `l0: ${Number(l0).toFixed(4)}`;
  divResBeta.textContent = `beta: ${Number(beta).toFixed(4)}`;
  divResL.textContent = `l: ${Number(l).toFixed(4)}`;
  const F =
    Fx === "undefined" && Fy === "undefined"
      ? ""
      : Math.sqrt(Fx * Fx + Fy * Fy);
  divResF.textContent = `F: ${Number(F).toFixed(4)}`;
  divResFx.textContent = `Fx: ${Number(Fx).toFixed(4)}`;
  divResFy.textContent = `Fy: ${Number(Fy).toFixed(4)}`;
}

function handleResIndexChange(state) {
  removeSelection();
  const option = selPointsOrRods.value;
  const index = +inpResIndex.value;
  if (index === -1) return;
  if (option === "points") initResPoint(state, index);
  else initResRod(state, index);
  if (!graphsChkBox.checked) select(option, index);
  enableCheckboxAddedToGraphs();
}

function handleChangeChkboxAddedToGraphs() {
  const checked = chkboxAddedToGraph.checked;
  const isOriginCentered = chkboxOriginCenter.checked;
  if (checked) {
    if (graphDetails.length === MAX_NUMBER_OF_GRAPHS) return;
    const nextGraphDetails = {
      option: selPointsOrRods.value,
      index: +inpResIndex.value,
      field: selField.value,
      isOriginCentered,
    };
    if (
      (nextGraphDetails.option === "points" &&
        nextGraphDetails.field === "N") ||
      nextGraphDetails.field === "Ffr"
    )
      nextGraphDetails.pointIndex = +inpResPointCollPointIndex.value;
    if (
      nextGraphDetails.option === "rods" &&
      (nextGraphDetails.field === "N" ||
        nextGraphDetails.field === "N1" ||
        nextGraphDetails.field === "N2" ||
        nextGraphDetails.field === "Ffr")
    ) {
      nextGraphDetails.pointIndex = +inpResRodCollPointIndex.value;
    }
    graphDetails.push(nextGraphDetails);
    setGraphDetails(nextGraphDetails);
  } else {
    let i = -1;
    let j = 0;
    while (j < MAX_NUMBER_OF_GRAPHS && i === -1) {
      if (
        areEqual(graphDetails[j], {
          option: selPointsOrRods.value,
          index: +inpResIndex.value,
          field: selField.value,
          isOriginCentered,
        }) ||
        areEqual(graphDetails[j], {
          option: selPointsOrRods.value,
          index: +inpResIndex.value,
          field: selField.value,
          isOriginCentered,
          pointIndex:
            selPointsOrRods.value === "points"
              ? +inpResPointCollPointIndex.value
              : +inpResRodCollPointIndex.value,
        })
      )
        i = j;
      j++;
    }
    if (i > -1) {
      graphDetails.splice(i, 1);
      removeGraphDetails(i);
    }
  }
}

function initResPeeking(state) {
  const divResT = document.querySelector("#res-t");
  const divResG = document.querySelector("#res-g");
  const { t, g, rods } = state;
  divResT.textContent = `t: ${Number(t).toFixed(4)}`;
  divResG.textContent = `g: ${Number(g).toFixed(4)}`;
  initResPeriodicExtForce(state);
  handlePointsOrRodsChange();
  handleResIndexChange(state);
  const len = rods.length;
  if (len > 0) initResRod(state, 0);
  chkboxAddedToGraph.addEventListener(
    "change",
    handleChangeChkboxAddedToGraphs
  );
}

inpResIndex.addEventListener("change", () => handleResIndexChange(getState()));

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", () => reset());
zoomInBtn.addEventListener("click", () => zoom(true));
zoomOutBtn.addEventListener("click", () => zoom(false));
switchBackBtn.addEventListener("click", () => {
  resultsChkBox.checked = false;
  handleShowResultsChange();
  removeSelection();
});

function handleChkboxChange() {
  initialState.isGridVisible = gridChkBox.checked;
  initialState.isTimeVisible = timeChkBox.checked;
  initialState.isForcesVisible = forceChkBox.checked;
  initialState.isEnergyVisible = energyChkBox.checked;
  initialState.isPathsVisible = pathChkBox.checked;
  initialState.isGraphsVisible = graphsChkBox.checked;
  setInitialState(initialState);
  draw(false);
}

gridChkBox.addEventListener("change", handleChkboxChange);
timeChkBox.addEventListener("change", handleChkboxChange);
forceChkBox.addEventListener("change", handleChkboxChange);
energyChkBox.addEventListener("change", handleChkboxChange);
pathChkBox.addEventListener("change", handleChkboxChange);
graphsChkBox.addEventListener("change", handleChkboxChange);
resultsChkBox.addEventListener("change", handleShowResultsChange);
