import { login, fetchProjects } from "../backend.js";
import { removeError, showError } from "../helper.js";

const BASE_URL = "/physics-engine/";
const DIALOG_MESSAGE =
  "Welcome, you are logged in. You can log out on the home page, where we redirect you";

const dialog = document.querySelector("dialog");
const btnOK = document.querySelector("#btn-ok");
const user = JSON.parse(localStorage.getItem("user"));
if (user && user.userID) {
  dialog.showModal();
  btnOK.addEventListener("click", () => {
    dialog.close();
    window.location.href = BASE_URL;
  });
} else {
  btnOK.addEventListener("click", () => {
    dialog.close();
  });
}

async function handleSubmit(event) {
  event.preventDefault();
  const email = document.querySelector("#inp-email").value;
  const password = document.querySelector("#inp-password").value;
  const user = {
    email,
    password,
  };
  removeError(dialog, DIALOG_MESSAGE);
  const json = await login(user);
  if (json.error) {
    console.error(json.error);
    showError(dialog, json.error);
  } else {
    const userID = json.user_id;
    const token = `Bearer ${json.token}`;
    localStorage.setItem("user", JSON.stringify({ userID, token }));
    await fetchProjects(userID);
    dialog.showModal();
    btnOK.addEventListener("click", () => {
      dialog.close();
      window.location.href = BASE_URL;
    });
  }
}

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);
