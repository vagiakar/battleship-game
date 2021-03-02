const btnVSComputer = document.querySelector("#btn-vs-computer");
const startGameSection = document.querySelector("#start-game");
const startGameHeading = document.querySelector("#start-game-heading");
const strategyPanelSection = document.querySelector("#strategy-panel");
btnVSComputer.addEventListener("click", startStrategy);

function startStrategy() {
  startGameSection.classList.add("visibility-hidden");
  btnVSComputer.classList.add("visibility-hidden");
  startGameHeading.classList.add("visibility-hidden");
  strategyPanelSection.classList.remove("display-none");
}
