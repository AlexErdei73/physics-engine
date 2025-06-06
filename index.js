console.log("JS has started!");

function draw() {
  const canvas = document.querySelector("canvas");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgb(200 0 0)";
    ctx.fillRect(100, 100, 200, 50);

    ctx.fillStyle = "rgb(0 0 200 / 50%)";
    ctx.fillRect(150, 75, 100, 50);
  }
}

window.addEventListener("load", draw);
