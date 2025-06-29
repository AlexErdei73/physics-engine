// Code from the image-storage project to handle the authentication and storage
const BASE_URL =
	"https://alexerdei-team.us.ainiro.io/magic/modules/physics-engine/";

export async function getJSON(response) {
	let json;
	try {
		json = await response.json();
	} catch (error) {
		json = [];
	}
	if (response.status > 299) throw Error(json.message);
	return json;
}

export async function register(user) {
	try {
		const response = await fetch(`${BASE_URL}register`, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});
		return await getJSON(response);
	} catch (error) {
		return { error };
	}
}

export async function login(user) {
	const { email, password } = user;
	const response = await fetch(
		`${BASE_URL}login?email=${email}&password=${password}`,
		{
			method: "GET",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	return await getJSON(response);
}
// end code from image-storage project

export async function postProject(project, id, isPublished, user) {
	const payload = {
		project_id: id,
		user_id: user.userID,
		isPublished,
		content: JSON.stringify(project),
	};
	try {
		const response = await fetch(`${BASE_URL}projects`, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
				Authorization: user.token,
			},
			body: JSON.stringify(payload),
		});
		return await getJSON(response);
	} catch (error) {
		return { error };
	}
}

export async function putProject(projectID, modification, token) {
	const payload = {
		project_id: projectID,
		...modification,
	};
	try {
		const response = await fetch(`${BASE_URL}projects`, {
			method: "PUT",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
			body: JSON.stringify(payload),
		});
		return await getJSON(response);
	} catch (error) {
		return { error };
	}
}

async function getProjects(userID) {
	let url = `${BASE_URL}projects?limit=-1`;
	if (userID) url += `&projects.user_id.eq=${userID}`;
	else url += `&projects.isPublished.eq=1`;
	try {
		const response = await fetch(url, {
			method: "GET",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
			},
		});
		return await getJSON(response);
	} catch (error) {
		return { error };
	}
}

export async function fetchProjects(userID = "") {
	const json = await getProjects(userID);
	if (json.error) {
		console.error(json.error);
		//showError(node, json.error);
	} else {
		const projects = json.map((project) => {
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
