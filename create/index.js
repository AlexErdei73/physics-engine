const emptyWorld = {
  name: "Empty World",
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

const projects = JSON.parse(localStorage.getItem("projects")) || [];

const initialState = projects.length > 0 ? projects[0] : emptyWorld;

const inpName = document.querySelector("#inp-name");
const inpG = document.querySelector("#inp-g");
const inpScale = document.querySelector("#inp-scale");
const inpDt = document.querySelector("#inp-dt");
const inpAnimTime = document.querySelector("#inp-anim-time");
const chkboxShowTime = document.querySelector("#chkbox-show-time");
const chkboxShowGrid = document.querySelector("#chkbox-show-grid");
const chkboxShowForce = document.querySelector("#chkbox-show-force");
const chkboxShowEnergy = document.querySelector("#chkbox-show-energy");

const inpPointIndex = document.querySelector("#inp-point-index");
const inpX = document.querySelector("#inp-x");
const inpY = document.querySelector("#inp-y");
const inpVx = document.querySelector("#inp-vx");
const inpVy = document.querySelector("#inp-vy");
const inpM = document.querySelector("#inp-m");
const inpPointSize = document.querySelector("#inp-point-size");
const chkboxFixed = document.querySelector("#chkbox-fixed");

const inpRodIndex = document.querySelector("#inp-rod-index");
const inpPoint1 = document.querySelector("#inp-point1");
const inpPoint2 = document.querySelector("#inp-point2");
const inpElast = document.querySelector("#inp-elast");
const inpBeta = document.querySelector("#inp-beta");
const inpLength = document.querySelector("#inp-length");
const inpRodSize = document.querySelector("#inp-rod-size");
const chkboxSpring = document.querySelector("#chkbox-spring");

const btnCreate = document.querySelector("#btn-create");
const btnSave = document.querySelector("#btn-save");
const btnNewPoint = document.querySelector("#btn-new-point");
const btnDeletePoint = document.querySelector("#btn-delete-point");
const btnNewRod = document.querySelector("#btn-new-rod");
const btnDeleteRod = document.querySelector("#btn-delete-rod");

function editPoint(i) {
  const { points } = initialState;
  if (i < 0 || i >= points.length) return;
  const point = points[i];
  inpX.value = point.x;
  inpY.value = point.y;
  inpPointSize.value = point.size;
  chkboxFixed.checked = point.isFixed;
  if (point.isFixed) {
    delete point.vx;
    delete point.vy;
    delete point.m;
    inpVx.disabled = true;
    inpVy.disabled = true;
    inpM.disabled = true;
  } else {
    inpVx.value = point.vx;
    inpVy.value = point.vy;
    inpM.value = point.m;
    inpVx.disabled = false;
    inpVy.disabled = false;
    inpM.disabled = false;
  }
}

function addPoint() {
  const { points } = initialState;

  points.push({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    m: 1,
    size: 0.2,
    isFixed: false,
  });

  inpPointIndex.min = 0;
  inpPointIndex.max = points.length - 1;
  inpPointIndex.value = points.length - 1;
  editPoint(points.length - 1);
}

function deletePoint(i) {
  const { points } = initialState;
  if (i < 0 || i >= points.length) return;

  if (points.length > 1) points.splice(i, 1);

  inpPointIndex.max = points.length - 1;
  inpPointIndex.value = points.length - 1;
  editPoint(points.length - 1);
}

function changePoint(i) {
  const { points } = initialState;
  if (i < 0 || i >= points.length) return;

  const point = points[i];
  point.x = +inpX.value || 0;
  point.y = +inpY.value || 0;
  point.size = +inpPointSize.value || 0.2;
  point.isFixed = chkboxFixed.checked;
  if (!point.isFixed) {
    point.vx = +inpVx.value || 0;
    point.vy = +inpVy.value || 0;
    point.m = +inpM.value || 1;
    inpVx.disabled = false;
    inpVy.disabled = false;
    inpM.disabled = false;
  } else {
    delete point.vx;
    delete point.vy;
    delete point.m;
    inpVx.disabled = true;
    inpVy.disabled = true;
    inpM.disabled = true;
  }
}

function editParams() {
  const {
    name,
    g,
    dt,
    animTime,
    scale,
    isTimeVisible,
    isGridVisible,
    isForcesVisible,
    isEnergyVisible,
  } = initialState;

  inpName.value = name;
  inpG.value = g;
  inpDt.value = dt;
  inpAnimTime.value = animTime;
  inpScale.value = scale;
  chkboxShowTime.checked = isTimeVisible;
  chkboxShowGrid.checked = isGridVisible;
  chkboxShowForce.checked = isForcesVisible;
  chkboxShowEnergy.checked = isEnergyVisible;
}

function changeParams() {
  initialState.g = +inpG.value || 0;
  initialState.dt = +inpDt.value || 1e-5;
  initialState.animTime = +inpAnimTime.value || 1 / 30;
  initialState.scale = +inpScale.value || 0.01;
  initialState.isTimeVisible = chkboxShowTime.checked;
  initialState.isGridVisible = chkboxShowGrid.checked;
  initialState.isForcesVisible = chkboxShowForce.checked;
  initialState.isEnergyVisible = chkboxShowEnergy.checked;

  editParams();
}

function save() {
  initialState.name = inpName.value || initialState.name;
  projects[0] = initialState;
  localStorage.setItem("projects", JSON.stringify(projects));
}

inpG.addEventListener("change", () => changeParams());
inpDt.addEventListener("change", () => changeParams());
inpAnimTime.addEventListener("change", () => changeParams());
inpScale.addEventListener("change", () => changeParams());
chkboxShowTime.addEventListener("change", () => changeParams());
chkboxShowGrid.addEventListener("change", () => changeParams());
chkboxShowForce.addEventListener("change", () => changeParams());
chkboxShowEnergy.addEventListener("change", () => changeParams());

inpPointIndex.addEventListener("change", () => editPoint(inpPointIndex.value));
chkboxFixed.addEventListener("change", () => changePoint(inpPointIndex.value));
inpX.addEventListener("change", () => changePoint(inpPointIndex.value));
inpY.addEventListener("change", () => changePoint(inpPointIndex.value));
inpVx.addEventListener("change", () => changePoint(inpPointIndex.value));
inpVy.addEventListener("change", () => changePoint(inpPointIndex.value));
inpM.addEventListener("change", () => changePoint(inpPointIndex.value));
inpPointSize.addEventListener("change", () => changePoint(inpPointIndex.value));
btnNewPoint.addEventListener("click", addPoint);
btnDeletePoint.addEventListener("click", () =>
  deletePoint(inpPointIndex.value)
);

const frm = document.querySelector("form");
frm.addEventListener("submit", (event) => event.preventDefault());
editParams();
btnSave.addEventListener("click", save);
const pointsLength = initialState.points.length;
editPoint(pointsLength - 1);
if (pointsLength > 0) {
  inpPointIndex.min = 0;
  inpPointIndex.max = pointsLength - 1;
  inpPointIndex.value = pointsLength - 1;
}
