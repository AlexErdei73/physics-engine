import { setInitialState, reset } from "./project/animation.js";
import { fetchProjects } from "./backend.js";

const BASE_URL = "/physics-engine/";

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

const NUMBER_OF_PROJECTS_ON_HOMEPAGE = 8;

let page = 0;

let projects = JSON.parse(localStorage.getItem("projects")) || [];
let len = projects.length;

if (len === 0) {
	await fetchProjects();
	projects = JSON.parse(localStorage.getItem("projects")) || [];
	len = projects.length;
	if (len === 0) {
		projects.push(emptyWorld);
		len++;
	}
}

const maxPage = Math.floor((len - 1) / NUMBER_OF_PROJECTS_ON_HOMEPAGE);

async function populateCanvases() {
	for (let i = 0; i < NUMBER_OF_PROJECTS_ON_HOMEPAGE; i++) {
		const canvId = `canv-${i}`;
		const figcapId = `figcap-${i}`;
		const canvas = document.querySelector(`#${canvId}`);
		const figcap = document.querySelector(`#${figcapId}`);
		const projectNumber = page * NUMBER_OF_PROJECTS_ON_HOMEPAGE + i;
		let initialState = projects[projectNumber];
		if (!initialState) initialState = emptyWorld;
		setInitialState(initialState);
		reset(canvas);
		figcap.textContent = initialState.name;
		canvas.textContent = initialState.description;
		const anchor = document.querySelector(`#a-${i}`);
		anchor.href = `${BASE_URL}project#${projectNumber}`;
		if (projectNumber >= projects.length) anchor.href = `${BASE_URL}project`;
	}
}

populateCanvases();

const btnBack = document.querySelector("#btn-back");
const btnNext = document.querySelector("#btn-next");
const btnLogout = document.querySelector("#btn-logout");
btnBack.addEventListener("click", () => {
	if (page > 0) {
		page--;
		populateCanvases();
	}
});
btnNext.addEventListener("click", () => {
	if (page < maxPage) {
		page++;
		populateCanvases();
	}
});
btnLogout.addEventListener("click", () => {
	localStorage.removeItem("user");
	localStorage.removeItem("projects");
	window.location.href = "/physics-engine/login/";
});
const user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.userID) btnLogout.disabled = true;
else btnLogout.disabled = false;
