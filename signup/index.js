import { register } from "../backend.js";

const BASE_URL = "/physics-engine/";

const dialog = document.querySelector("dialog");

async function handleSubmit(event) {
	event.preventDefault();
	const email = document.querySelector("#inp-email").value;
	const password = document.querySelector("#inp-password").value;
	const firstname = document.querySelector("#inp-firstname").value;
	const lastname = document.querySelector("#inp-lastname").value;
	const user = {
		email,
		password,
		firstname,
		lastname,
	};
	//removeError(node);
	const json = await register(user);
	if (json.error) {
		console.error(json.error);
		//showError(node, json.error);
	} else {
		dialog.showModal();
	}
}

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);

const btnOK = document.querySelector("#btn-ok");
btnOK.addEventListener("click", () => {
	dialog.close();
	window.location.href = BASE_URL;
});
