import {
  displayGameSection,
  drawShipsOnPlayerGrid,
  fillComputerGrid,
  hitShipLogic,
  eventListnersFunctions,
  deleteEventListenersFunctions,
  game,
  gameoverSection,
  gameResult,
  gameoverModal,
  changeTurnText,
} from "./game.js";
import {
  dragEnd,
  dragStart,
  dragover,
  undropShips,
  setDragoverPosition,
  resetDragging,
  resetDraggingLength,
} from "./dragAndDrop.js";
import { handleRotate, resetHorizontal } from "./rotate.js";
const btnVSComputer = document.querySelector("#btn-vs-computer");
const startGameSection = document.querySelector("#start-game");
const startGameHeading = document.querySelector("#start-game-heading");
export const strategySection = document.querySelector("#strategy-panel");
export const strategyPlayerGrid = document.querySelector(
  "#strategy-player-grid"
);
const rotateBtn = document.querySelector("#rotate-btn");
export const startGameBtn = document.querySelector("#start-game-btn");
const deleteAllBtn = document.querySelector("#delete-all-btn");
export const shipsGrid = document.querySelector("#ships-grid");
export const gamePlayerGrid = document.querySelector("#game-player-grid");
export const gameComputerGrid = document.querySelector("#game-computer-grid");
export const ships = [...document.querySelectorAll("[data-ship-name]")];
const restartBtn = document.querySelector("#restart-btn");

export let playerGridData = [];
export let computerGridData = [];
let clickOffsetX;
let clickOffsetY;
export const GRID_SIZE = 10;

initialiseGridData(playerGridData);
initialiseGridData(computerGridData);
populateBoards();

btnVSComputer.addEventListener("click", displayStrategySection);
startGameBtn.addEventListener("click", handleGame);
restartBtn.addEventListener("click", restart);
rotateBtn.addEventListener("click", handleRotate);
deleteAllBtn.addEventListener("click", undropShips);

ships.forEach((ship) => {
  ship.addEventListener("dragstart", (e) => {
    clickOffsetX = e.offsetX;
    clickOffsetY = e.offsetY;
    dragStart(e);
  });
  ship.addEventListener("dragend", (e) => {
    dragEnd(e);
  });
});
strategyPlayerGrid.addEventListener("dragover", (e) => {
  dragover(e, clickOffsetX, clickOffsetY);
});

function initialiseGridData(gridData) {
  for (let x = 0; x < GRID_SIZE; x++) {
    const row = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const item = {
        placed: null,
        hit: null,
        row: x + 1,
        column: y + 1,
        element: document.createElement("div"),
        gameElement: document.createElement("div"),
      };
      row.push(item);
    }
    gridData.push(row);
  }
}

function populateBoards() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      playerGridData[x][y].element.classList.add("strategy-player-grid-item");
      strategyPlayerGrid.append(playerGridData[x][y].element);
      playerGridData[x][y].gameElement.classList.add("game-player-grid-item");
      gamePlayerGrid.append(playerGridData[x][y].gameElement);
      computerGridData[x][y].gameElement.classList.add(
        "game-computer-grid-item"
      );
      gameComputerGrid.append(computerGridData[x][y].gameElement);
    }
  }
}

function displayStrategySection() {
  startGameSection.classList.add("visibility-hidden");
  btnVSComputer.classList.add("visibility-hidden");
  startGameHeading.classList.add("visibility-hidden");
  strategySection.classList.remove("display-none");
}

function handleGame() {
  displayGameSection();
  drawShipsOnPlayerGrid();
  fillComputerGrid();
  hitShipLogic();
}

function restart() {
  resetDOM();
  undropShips();
  removeEventListeners();
  resetGlobalVariables();
}

function removeEventListeners() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      computerGridData[x][y].gameElement.removeEventListener(
        "click",
        eventListnersFunctions[x][y],
        {
          once: true,
        }
      );
    }
  }
}
function resetDOM() {
  startGameSection.classList.remove("visibility-hidden");
  btnVSComputer.classList.remove("visibility-hidden");
  startGameHeading.classList.remove("visibility-hidden");
  strategySection.classList.add("display-none");
  game.classList.add("display-none");
  gameoverSection.classList.add("visibility-hidden");
  gameoverModal.classList.remove("active");
  playerGridData.forEach((row) => {
    row.forEach((item) => {
      item.gameElement.classList.remove("hit-miss");
      item.gameElement.classList.remove("hit-success");
    });
  });
  computerGridData.forEach((row) => {
    row.forEach((item) => {
      item.gameElement.classList.remove("hit-miss");
      item.gameElement.classList.remove("hit-success");
    });
  });
  gameResult.innerText = "";
  changeTurnText("Player");
  computerGridData.forEach((row) => {
    row.forEach((item) => {
      item.gameElement.style.pointerEvents = "all";
    });
  });
  playerGridData.forEach((row) => {
    row.forEach((item) => {
      item.gameElement.style.background = "";
      item.gameElement.style.border = "";
    });
  });
}

function resetGlobalVariables() {
  setDragoverPosition(null);
  resetDragging();
  resetDraggingLength();
  resetHorizontal();
  deleteEventListenersFunctions();
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      computerGridData[x][y].hit = null;
      computerGridData[x][y].placed = null;
      playerGridData[x][y].hit = null;
      playerGridData[x][y].placed = null;
    }
  }
  clickOffsetX = null;
  clickOffsetY = null;
}

export function isOverShip(dragoverPosition, rotate = false) {
  if (dragoverPosition === null) return false;
  const newDragoverPosition = [...dragoverPosition];
  if (rotate) {
    newDragoverPosition.shift();
  }
  return newDragoverPosition.some((position) => {
    return playerGridData[position.row - 1][position.column - 1].placed != null;
  });
}

export function checkIfRowOrColumnExists(positions) {
  if (!positions) return false;
  if (
    positions.some((position) => {
      return position.row > GRID_SIZE || position.column > GRID_SIZE;
    })
  ) {
    return false;
  }
  return true;
}

/*
//interact js for drag and drop in mobile
let position = { x: 0, y: 0 };
ships.forEach((ship) => {
  interact(ship).draggable({
    listeners: {
      start(e) {
        rect = e.target.getBoundingClientRect();
        clickOffsetX = e.clientX - rect.left;
        clickOffsetY = e.clientY - rect.top;
        dragStart(e);
      },
      move(event) {
        position.x += event.dx;
        position.y += event.dy;

        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
      },
    },
  });
});
interact(strategyPlayerGrid)
  .dropzone({
    accept: ".ship",
  })
  .on("dropmove", (e) => {
    dragover(e.dragEvent, clickOffsetX, clickOffsetY);
  })
  .on("drop", (e) => {
    dragEnd(e.dragEvent);
  });
*/
