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
