import { setInitialState, reset } from "./project/animation.js";

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

if (projects.length === 0) projects.push(emptyWorld);

const NUMBER_OF_PROJECTS_ON_HOMEPAGE = 8;
for (let i = 0; i < NUMBER_OF_PROJECTS_ON_HOMEPAGE; i++) {
  const canvId = `canv-${i}`;
  const figcapId = `figcap-${i}`;
  const canvas = document.querySelector(`#${canvId}`);
  const figcap = document.querySelector(`#${figcapId}`);
  let initialState = projects[i];
  if (!initialState) initialState = emptyWorld;
  setInitialState(initialState);
  reset(canvas);
  figcap.textContent = initialState.name;
  canvas.textContent = initialState.name;
}
