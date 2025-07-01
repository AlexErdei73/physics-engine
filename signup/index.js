import { register } from "../backend.js";
import { removeError, showError } from "../helper.js";

const BASE_URL = "/physics-engine/";
const DIALOG_MESSAGE = "Successful registration, please verify your email.";

const dialog = document.querySelector("dialog");
const btnOK = document.querySelector("#btn-ok");
btnOK.addEventListener("click", () => {
  dialog.close();
});

async function handleSubmit(event) {
  event.preventDefault();
  const email = document.querySelector("#inp-email").value;
  const password = document.querySelector("#inp-password").value;
  const confirmPsw = document.querySelector("#inp-confirm-psw").value;
  const firstname = document.querySelector("#inp-firstname").value;
  const lastname = document.querySelector("#inp-lastname").value;
  const user = {
    email,
    password,
    firstname,
    lastname,
  };
  removeError(dialog, DIALOG_MESSAGE);
  if (password !== confirmPsw) {
    const message = "Password and confirm psw should be the same!";
    console.error(message);
    showError(dialog, message);
    return;
  }
  const json = await register(user);
  if (json.error) {
    console.error(json.error);
    showError(dialog, json.error);
  } else {
    dialog.showModal();
    const btnOK = document.querySelector("#btn-ok");
    btnOK.addEventListener("click", () => {
      dialog.close();
      window.location.href = BASE_URL;
    });
  }
}

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);
