import { login } from "../backend.js";

const userLoggedIn = {
	email: "",
	token: "",
};

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
		//await fetchStorage();
		window.location.href = "/physics-engine/";
	}
}

const inpEmail = document.querySelector("#inp-email");
inpEmail.addEventListener(
	"change",
	() => (userLoggedIn.email = inpEmail.value)
);

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);
