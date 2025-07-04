import { deleteProject, postProject, putProject } from "../backend.js";

const BASE_URL = "/physics-engine/";
const pageURL = window.location.href;

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
const user = JSON.parse(localStorage.getItem("user")) || {
	userID: "",
	token: "",
};

function getProjectIndex(url) {
	const array = url.split("#");
	const len = array.length;
	const index = +array[len - 1];
	return isNaN(index) ? projects.length - 1 : index;
}

let projectIndex = getProjectIndex(pageURL);

let initialState = projects.length > 0 ? projects[projectIndex] : emptyWorld;

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
const chkboxPathVisible = document.querySelector("#chkbox-path-visible");

const inpRodIndex = document.querySelector("#inp-rod-index");
const inpPoint1 = document.querySelector("#inp-point1");
const inpPoint2 = document.querySelector("#inp-point2");
const inpElast = document.querySelector("#inp-elast");
const inpBeta = document.querySelector("#inp-beta");
const inpLength = document.querySelector("#inp-length");
const inpRodSize = document.querySelector("#inp-rod-size");
const chkboxSpring = document.querySelector("#chkbox-spring");

const inpExtForcePointIndex = document.querySelector(
	"#inp-ext-force-point-index"
);
const inpTMin = document.querySelector("#inp-t-min");
const inpTMax = document.querySelector("#inp-t-max");
const inpFreqMin = document.querySelector("#inp-freq-min");
const inpFreqMax = document.querySelector("#inp-freq-max");
const inpF0x = document.querySelector("#inp-F0x");
const inpFix = document.querySelector("#inp-fix");
const inpF0y = document.querySelector("#inp-F0y");
const inpFiy = document.querySelector("#inp-fiy");
const chkboxOn = document.querySelector("#chkbox-on");

const btnCreate = document.querySelector("#btn-create");
const btnSave = document.querySelector("#btn-save");
const btnDelete = document.querySelector("#btn-delete");
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
	chkboxPathVisible.checked = point.isPathVisible;
	if (point.isFixed) {
		delete point.vx;
		delete point.vy;
		delete point.m;
		inpVx.disabled = true;
		inpVy.disabled = true;
		inpM.disabled = true;
		chkboxPathVisible.disabled = true;
	} else {
		inpVx.value = point.vx;
		inpVy.value = point.vy;
		inpM.value = point.m;
		inpVx.disabled = false;
		inpVy.disabled = false;
		inpM.disabled = false;
		chkboxPathVisible.disabled = false;
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

	points.splice(i, 1);

	inpPointIndex.max = points.length - 1;
	inpPointIndex.value = points.length - 1;
	points.length === 0 ? deletePointInputs() : editPoint(points.length - 1);
}

function changePoint(i) {
	const { points } = initialState;
	if (i < 0 || i >= points.length) return;

	const point = points[i];
	point.x = +inpX.value || 0;
	point.y = +inpY.value || 0;
	point.size = +inpPointSize.value || 0.2;
	point.isFixed = chkboxFixed.checked;
	point.isPathVisible = chkboxPathVisible.checked;
	if (!point.isFixed) {
		point.vx = +inpVx.value || 0;
		point.vy = +inpVy.value || 0;
		point.m = +inpM.value || 1;
		inpVx.disabled = false;
		inpVy.disabled = false;
		inpM.disabled = false;
		chkboxPathVisible.disabled = false;
	} else {
		delete point.vx;
		delete point.vy;
		delete point.m;
		inpVx.disabled = true;
		inpVy.disabled = true;
		inpM.disabled = true;
		chkboxPathVisible.disabled = true;
	}
}

function editRod(i) {
	const { rods } = initialState;
	if (i < 0 || i >= rods.length) return;
	const rod = rods[i];
	inpPoint1.value = rod.point1;
	inpPoint2.value = rod.point2;
	inpElast.value = rod.elast;
	inpLength.value = rod.length;
	inpBeta.value = rod.beta;
	inpRodSize.value = rod.size;
	chkboxSpring.checked = rod.isSpring;
}

function addRod() {
	const { points, rods } = initialState;

	if (points.length < 2) return;

	rods.push({
		point1: 0,
		point2: 1,
		elast: 1e4,
		beta: 0,
		length: 1,
		size: 0.2,
		isSpring: false,
	});

	inpRodIndex.min = 0;
	inpRodIndex.max = rods.length - 1;
	inpRodIndex.value = rods.length - 1;
	editRod(rods.length - 1);
}

function deleteRod(i) {
	const { rods } = initialState;
	if (i < 0 || i >= rods.length) return;

	rods.splice(i, 1);

	inpRodIndex.max = rods.length - 1;
	inpRodIndex.value = rods.length - 1;
	rods.length === 0 ? deleteRodInputs() : editRod(rods.length - 1);
}

function changeRod(i) {
	const { points, rods } = initialState;
	if (i < 0 || i >= rods.length) return;

	const rod = rods[i];
	const point1 = +inpPoint1.value || 0;
	const point2 = +inpPoint2.value || 1;
	if (0 <= point1 && point1 < points.length && point1 !== point2)
		rod.point1 = point1;
	if (0 <= point2 && point2 < points.length && point1 !== point2)
		rod.point2 = point2;
	rod.elast = +inpElast.value || 1e4;
	rod.beta = +inpBeta.value || 0;
	rod.length = +inpLength.value || 1;
	rod.size = +inpRodSize.value || 0.2;
	rod.isSpring = chkboxSpring.checked;
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

function editPeriodicExternalForce() {
	const { periodicExtForce } = initialState;
	if (!periodicExtForce) return;
	const { point, tMin, tMax, freqMin, freqMax, F0x, fix, F0y, fiy, isOn } =
		periodicExtForce;
	inpExtForcePointIndex.value = point;
	inpTMin.value = tMin;
	inpTMax.value = tMax;
	inpFreqMin.value = freqMin;
	inpFreqMax.value = freqMax;
	inpF0x.value = F0x;
	inpF0y.value = F0y;
	inpFix.value = fix;
	inpFiy.value = fiy;
	chkboxOn.checked = isOn;
}

function changePeriodicExtForce() {
	inpExtForcePointIndex.max = initialState.points.length - 1;
	const periodicExtForce = {
		point: +inpExtForcePointIndex.value || 0,
		tMin: +inpTMin.value || 0,
		tMax: +inpTMax.value || 10000,
		freqMin: +inpFreqMin.value || 0,
		freqMax: +inpFreqMax.value || 100,
		omega: Math.PI * (+inpFreqMin.value + +inpFreqMax.value) || 157.08,
		F0x: +inpF0x.value || 0,
		F0y: +inpF0y.value || 0,
		fix: +inpFix.value || 0,
		fiy: +inpFiy.value || 0,
		isOn: chkboxOn.checked,
	};
	initialState.periodicExtForce = periodicExtForce;

	editPeriodicExternalForce();
}

function deletePointInputs() {
	inpPointIndex.value = "";
	inpX.value = "";
	inpY.value = "";
	inpVx.value = "";
	inpVy.value = "";
	inpM.value = "";
	inpPointSize.value = "";
	chkboxFixed.checked = false;
}

function deleteRodInputs() {
	inpRodIndex.value = "";
	inpPoint1.value = "";
	inpPoint2.value = "";
	inpElast.value = "";
	inpBeta.value = "";
	inpRodSize.value = "";
	inpLength.value = "";
	chkboxSpring.checked = false;
}

function updateLinks() {
	const aCreate = document.querySelector("#a-create");
	const aProject = document.querySelector("#a-project");
	aCreate.href =
		projectIndex < projects.length
			? `${BASE_URL}create#${projectIndex}`
			: `${BASE_URL}create`;
	aProject.href =
		projectIndex < projects.length
			? `${BASE_URL}project#${projectIndex}`
			: `${BASE_URL}project`;
}

async function save() {
	initialState.name = inpName.value || initialState.name;
	projects[projectIndex] = initialState;
	localStorage.setItem("projects", JSON.stringify(projects));
	const { projectID, userID } = initialState;
	if (userID !== user.userID) return;
	delete initialState.projectID;
	delete initialState.userID;
	delete initialState.isPublished;
	const json = await putProject(
		projectID,
		{ content: JSON.stringify(initialState) },
		user.token
	);
	if (json.error) {
		console.error(json.error);
		//showError(node, json.error);
	} else {
		initialState.projectID = projectID;
		initialState.userID = user.userID;
		initialState.isPublished = chkboxPublished.checked;
		projects[projectIndex] = initialState;
	}
}

async function create() {
	initialState = emptyWorld;
	projects.push(initialState);
	projectIndex = projects.length - 1;
	localStorage.setItem("projects", JSON.stringify(projects));
	editParams();
	deletePointInputs();
	deleteRodInputs();
	const userStr = localStorage.getItem("user");
	if (!userStr) return;
	const user = JSON.parse(userStr);
	const projectID = crypto.randomUUID();
	const json = await postProject(initialState, projectID, 0, user);
	if (json.error) {
		console.error(json.error);
		//showError(node, json.error);
	} else {
		initialState.projectID = projectID;
		initialState.userID = user.userID;
		initialState.isPublished = false;
		projects[projectIndex] = initialState;
		updateLinks();
	}
}

const dlg = document.querySelector("dialog");
const btnCancel = document.querySelector("#btn-cancel");
const btnProceed = document.querySelector("#btn-proceed");
function handleClickDelete() {
	dlg.showModal();
}
btnDelete.addEventListener("click", handleClickDelete);
btnCancel.addEventListener("click", () => dlg.close());
btnProceed.addEventListener("click", async () => {
	if (projectIndex < 0 || projectIndex >= projects.length) {
		dlg.close();
		return;
	} else {
		const json = await deleteProject(
			projects[projectIndex].projectID,
			user.token
		);
		if (json.error) {
			console.error(json.error);
			//showError(node, json.error);
		}
		projects.splice(projectIndex, 1);
		localStorage.setItem("projects", JSON.stringify(projects));
		if (projectIndex === projects.length) projectIndex--;
		initialState = projects[projectIndex];
		editParams();
		const { points, rods } = initialState;
		if (points.length === 0) deletePointInputs();
		else {
			inpPointIndex.value = 0;
			inpPointIndex.max = points.length - 1;
		}
		if (rods.length === 0) deleteRodInputs();
		else {
			inpRodIndex.value = 0;
			inpRodIndex.max = rods.length - 1;
		}
		updateLinks();
		dlg.close();
	}
});

inpG.addEventListener("change", () => changeParams());
inpDt.addEventListener("change", () => changeParams());
inpAnimTime.addEventListener("change", () => changeParams());
inpScale.addEventListener("change", () => changeParams());
chkboxShowTime.addEventListener("change", () => changeParams());
chkboxShowGrid.addEventListener("change", () => changeParams());
chkboxShowForce.addEventListener("change", () => changeParams());
chkboxShowEnergy.addEventListener("change", () => changeParams());

inpExtForcePointIndex.addEventListener("change", () =>
	changePeriodicExtForce()
);
inpTMax.addEventListener("change", () => changePeriodicExtForce());
inpTMin.addEventListener("change", () => changePeriodicExtForce());
inpFreqMax.addEventListener("change", () => changePeriodicExtForce());
inpFreqMin.addEventListener("change", () => changePeriodicExtForce());
inpF0x.addEventListener("change", () => changePeriodicExtForce());
inpF0y.addEventListener("change", () => changePeriodicExtForce());
inpFix.addEventListener("change", () => changePeriodicExtForce());
inpFiy.addEventListener("change", () => changePeriodicExtForce());
chkboxOn.addEventListener("change", () => changePeriodicExtForce());

inpPointIndex.addEventListener("change", () => editPoint(inpPointIndex.value));
chkboxFixed.addEventListener("change", () => changePoint(inpPointIndex.value));
chkboxPathVisible.addEventListener("change", () =>
	changePoint(inpPointIndex.value)
);
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

inpRodIndex.addEventListener("change", () => editRod(inpRodIndex.value));
chkboxSpring.addEventListener("change", () => changeRod(inpRodIndex.value));
inpPoint1.addEventListener("change", () => changeRod(inpRodIndex.value));
inpPoint2.addEventListener("change", () => changeRod(inpRodIndex.value));
inpElast.addEventListener("change", () => changeRod(inpRodIndex.value));
inpBeta.addEventListener("change", () => changeRod(inpRodIndex.value));
inpLength.addEventListener("change", () => changeRod(inpRodIndex.value));
btnNewRod.addEventListener("click", addRod);
btnDeleteRod.addEventListener("click", () => deleteRod(inpRodIndex.value));

const frm = document.querySelector("form");
frm.addEventListener("submit", (event) => event.preventDefault());
editParams();
editPeriodicExternalForce();
btnSave.addEventListener("click", save);
btnCreate.addEventListener("click", create);
const pointsLength = initialState.points.length;
editPoint(pointsLength - 1);
if (pointsLength > 0) {
	inpPointIndex.min = 0;
	inpPointIndex.max = pointsLength - 1;
	inpPointIndex.value = pointsLength - 1;
	inpExtForcePointIndex.max = pointsLength - 1;
}
const rodsLength = initialState.rods.length;
editRod(rodsLength - 1);
if (rodsLength > 0) {
	inpRodIndex.min = 0;
	inpRodIndex.max = rodsLength - 1;
	inpRodIndex.value = rodsLength - 1;
}

updateLinks();

const chkboxPublished = document.querySelector("#chkbox-published");
chkboxPublished.checked = !!initialState.isPublished;
chkboxPublished.disabled = !user.userID || initialState.userID !== user.userID;
chkboxPublished.addEventListener("change", async () => {
	chkboxPublished.disabled = true;
	const isPublished = +chkboxPublished.checked;
	const json = await putProject(
		initialState.projectID,
		{ isPublished },
		user.token
	);
	if (json.error) {
		console.error(json.error);
		chkboxPublished.checked = !isPublished;
	} else {
		initialState.isPublished = !!isPublished;
	}
	chkboxPublished.disabled = false;
});
