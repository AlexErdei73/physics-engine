import {
	draw,
	setInitialState,
	start,
	stop,
	reset,
	zoom,
} from "./animation.js";

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

function getProjectIndex(url) {
	const array = url.split("#");
	const len = array.length;
	const index = +array[len - 1];
	return isNaN(index) ? projects.length - 1 : index;
}

let projectIndex = getProjectIndex(pageURL);

let initialState =
	projects.length > 0 && projectIndex < projects.length
		? projects[projectIndex]
		: emptyWorld;
initialState.isPathsVisible = true;
initialState.points[0].isPathVisible = true;
setInitialState(initialState);

reset();
const startBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const resetBtn = document.querySelector("#reset");
const zoomInBtn = document.querySelector("#zoom-in");
const zoomOutBtn = document.querySelector("#zoom-out");

const gridChkBox = document.querySelector("#grid");
const timeChkBox = document.querySelector("#time");
const forceChkBox = document.querySelector("#force");
const energyChkBox = document.querySelector("#energy");

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", () => reset());
zoomInBtn.addEventListener("click", () => zoom(true));
zoomOutBtn.addEventListener("click", () => zoom(false));

gridChkBox.checked = initialState.isGridVisible;
timeChkBox.checked = initialState.isTimeVisible;
forceChkBox.checked = initialState.isForcesVisible;
energyChkBox.checked = initialState.isEnergyVisible;

function handleChkboxChange() {
	initialState.isGridVisible = gridChkBox.checked;
	initialState.isTimeVisible = timeChkBox.checked;
	initialState.isForcesVisible = forceChkBox.checked;
	initialState.isEnergyVisible = energyChkBox.checked;
	setInitialState(initialState);
	draw(false);
}

gridChkBox.addEventListener("change", handleChkboxChange);
timeChkBox.addEventListener("change", handleChkboxChange);
forceChkBox.addEventListener("change", handleChkboxChange);
energyChkBox.addEventListener("change", handleChkboxChange);

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
