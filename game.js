import {
  playerGridData,
  computerGridData,
  strategySection,
  ships,
  GRID_SIZE,
  checkIfRowOrColumnExists,
} from "./app.js";

export const game = document.querySelector("#game");
export const turnText = document.querySelector("#turn-text");
export const gameoverSection = document.querySelector("#game-over-section");
export const gameResult = document.querySelector("#game-result");
export const gameoverModal = document.querySelector("#game-over-modal");
export let eventListnersFunctions = [];
export function displayGameSection() {
  strategySection.classList.add("display-none");
  game.classList.remove("display-none");
}

export function drawShipsOnPlayerGrid() {
  playerGridData.forEach((row) =>
    row.forEach((item) => {
      if (item.placed !== null) {
        item.gameElement.style.background = "white";
        item.gameElement.style.border = "none";
      }
    })
  );
}

export function fillComputerGrid() {
  ships.forEach((ship) => {
    let shipLocation;

    while (
      !checkIfRowOrColumnExists(shipLocation) ||
      checkIfLocationIsFilled(shipLocation)
    ) {
      shipLocation = [];
      const shipLength = parseInt(ship.dataset.shipLength);
      const randomRow = Math.floor(Math.random() * GRID_SIZE + 1);
      const randomColumn = Math.floor(Math.random() * GRID_SIZE + 1);
      const randomIsHorizontal = Math.random() < 0.5;
      if (randomIsHorizontal) {
        for (let i = 0; i < shipLength; i++) {
          shipLocation.push({ row: randomRow, column: randomColumn + i });
        }
      } else {
        for (let i = 0; i < shipLength; i++) {
          shipLocation.push({ row: randomRow + i, column: randomColumn });
        }
      }
    }
    shipLocation.forEach((location) => {
      computerGridData[location.row - 1][location.column - 1].placed =
        ship.dataset.shipName;
    });
  });
}

function checkIfLocationIsFilled(shipLocation) {
  return shipLocation.some((location) => {
    return (
      computerGridData[location.row - 1][location.column - 1].placed !== null
    );
  });
}

export function hitShipLogic() {
  computerGridData.forEach((row) => {
    let listenerRow = [];
    row.forEach((item) => {
      const eventListnerFunction = () => handleClick(item);
      listenerRow.push(eventListnerFunction);
      item.gameElement.addEventListener("click", eventListnerFunction, {
        once: true,
      });
    });
    eventListnersFunctions.push(listenerRow);
  });
}

function handleClick(item) {
  playerMove(item);
  if (checkForWin(computerGridData)) {
    gameoverSection.classList.remove("visibility-hidden");
    gameoverModal.classList.add("active");
    gameResult.innerText = "VICTORY";
    return;
  }
  changeTurnText("Computer");
  computerGridData.forEach((row) => {
    row.forEach((item) => {
      item.gameElement.style.pointerEvents = "none";
    });
  });
  setTimeout(() => {
    computerMove();
    if (checkForWin(playerGridData)) {
      gameoverSection.classList.remove("visibility-hidden");
      gameoverModal.classList.add("active");
      gameResult.innerText = "YOU LOSE";
      return;
    }
    changeTurnText("Player");
    computerGridData.forEach((row) => {
      row.forEach((item) => {
        item.gameElement.style.pointerEvents = "all";
      });
    });
  }, 1000);
}

export function changeTurnText(text) {
  turnText.innerText = text;
}

function playerMove(item) {
  if (item.placed !== null) {
    item.hit = "success";
    item.gameElement.classList.add("hit-success");
  } else {
    item.hit = "miss";
    item.gameElement.classList.add("hit-miss");
  }
}

function computerMove() {
  let randomRow = Math.floor(Math.random() * GRID_SIZE + 1);
  let randomColumn = Math.floor(Math.random() * GRID_SIZE + 1);
  while (isIndexHit(randomRow, randomColumn)) {
    randomRow = Math.floor(Math.random() * GRID_SIZE + 1);
    randomColumn = Math.floor(Math.random() * GRID_SIZE + 1);
  }
  if (playerGridData[randomRow - 1][randomColumn - 1].placed !== null) {
    playerGridData[randomRow - 1][randomColumn - 1].hit = "success";
    playerGridData[randomRow - 1][randomColumn - 1].gameElement.classList.add(
      "hit-success"
    );
  } else {
    playerGridData[randomRow - 1][randomColumn - 1].hit = "miss";
    playerGridData[randomRow - 1][randomColumn - 1].gameElement.classList.add(
      "hit-miss"
    );
  }
}

function isIndexHit(randomRow, randomColumn) {
  return playerGridData[randomRow - 1][randomColumn - 1].hit !== null;
}

function checkForWin(gridData) {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (gridData[x][y].placed !== null && gridData[x][y].hit !== "success") {
        return false;
      }
    }
  }
  return true;
}
export function deleteEventListenersFunctions() {
  eventListnersFunctions = [];
}
