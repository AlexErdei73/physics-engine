function dealWithError(node, message, isShow) {
  isShow ? node.classList.add("error") : node.classList.remove("error");
  const paragraph = node.querySelector("p");
  paragraph.textContent = message;
  isShow ? node.showModal() : node.close();
}

export function removeError(node, message) {
  dealWithError(node, message, false);
}

export function showError(node, message) {
  dealWithError(node, message, true);
}
