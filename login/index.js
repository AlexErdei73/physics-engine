import { login, getProjects } from "../backend.js";

const BASE_URL = "/physics-engine/";

const userLoggedIn = {
	email: "",
	token: "",
};

async function fetchProjects() {
	const json = await getProjects();
	console.log(json);
	if (json.error) {
		console.error(json.error);
		//showError(node, json.error);
	} else {
		const projects = json
			.filter(
				(project) =>
					project.user_id === userLoggedIn.userID || !!project.isPublished
			)
			.map((project) => {
				return {
					projectID: project.project_id,
					userID: project.user_id,
					isPublished: !!project.isPublished,
					...JSON.parse(project.content),
				};
			});
		localStorage.setItem("projects", JSON.stringify(projects));
	}
}

async function handleSubmit(event) {
	event.preventDefault();
	const email = document.querySelector("#inp-email").value;
	const password = document.querySelector("#inp-password").value;
	const user = {
		email,
		password,
	};
	//removeError(node);
	const json = await login(user);
	if (json.error) {
		console.error(json.error);
		//showError(node, json.error);
	} else {
		userLoggedIn.userID = json.user_id;
		userLoggedIn.token = `Bearer ${json.token}`;
		localStorage.setItem("user", JSON.stringify(userLoggedIn));
		//setUser(userLoggedIn);
		//removeStorage();
		await fetchProjects();
		window.location.href = BASE_URL;
	}
}

const inpEmail = document.querySelector("#inp-email");
inpEmail.addEventListener(
	"change",
	() => (userLoggedIn.email = inpEmail.value)
);

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);

const dialog = document.querySelector("dialog");
const user = JSON.parse(localStorage.getItem("user"));
if (user && user.userID) {
	dialog.showModal();
}
const btnOK = document.querySelector("#btn-ok");
btnOK.addEventListener("click", () => {
	dialog.close();
	window.location.href = BASE_URL;
});
