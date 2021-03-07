const btnVSComputer = document.querySelector("#btn-vs-computer");
const startGameSection = document.querySelector("#start-game");
const startGameHeading = document.querySelector("#start-game-heading");
const strategySection = document.querySelector("#strategy-panel");
const strategyPlayerGrid = document.querySelector("#strategy-player-grid");
const strategyPlayerGridItems = [
  ...document.querySelectorAll("[data-strategy-player-grid-item]"),
];
const rotateBtn = document.querySelector("#rotate-btn");
const startGameBtn = document.querySelector("#start-game-btn");
const deleteAllBtn = document.querySelector("#delete-all-btn");
const shipsGrid = document.querySelector("#ships-grid");
const ships = [...document.querySelectorAll("[data-ship-name]")];
const game = document.querySelector("#game");
const computerGridItems = [
  ...document.querySelectorAll("[data-computer-grid-item]"),
];
const playerGridItems = [
  ...document.querySelectorAll("[data-player-grid-item]"),
];
const turnText = document.querySelector("#turn-text");
const gameoverSection = document.querySelector("#game-over-section");
const gameResult = document.querySelector("#game-result");
const gameoverModal = document.querySelector("#game-over-modal");
const restartBtn = document.querySelector("#restart-btn");
let dragoverRows;
let dragoverColumns;
let dragoverIndexes;
let dragging;
let isHorizontal;
let draggingLength;
const GRID_SIZE = 10;
let playerGridData = [];
let computerGridData = [];

btnVSComputer.addEventListener("click", handleStrategy);

startGameBtn.addEventListener("click", () => {
  handleGame();
});

restartBtn.addEventListener("click", restart);

function handleStrategy() {
  initialisePlayerGridData();
  displayStrategySection();
  handleDragAndDropShips();
  handleRotate();
  handleDeleteAll();
}

function initialisePlayerGridData() {
  for (let i = 0; i < 100; i++) {
    playerGridData.push({ placed: null, hit: null });
    computerGridData.push({ placed: null, hit: null });
  }
}

function displayStrategySection() {
  startGameSection.classList.add("visibility-hidden");
  btnVSComputer.classList.add("visibility-hidden");
  startGameHeading.classList.add("visibility-hidden");
  strategySection.classList.remove("display-none");
}

function handleDragAndDropShips() {
  let clickOffsetX;
  let clickOffsetY;

  ships.forEach((ship) => {
    ship.addEventListener("dragstart", (e) => {
      [clickOffsetX, clickOffsetY] = dragStart(e, clickOffsetX, clickOffsetY);
    });
    ship.addEventListener("dragend", (e) => {
      dragEnd(e);
    });
  });
  strategyPlayerGrid.addEventListener("dragover", (e) => {
    dragover(e, clickOffsetX, clickOffsetY);
  });
}

function dragStart(e, clickOffsetX, clickOffsetY) {
  e.target.classList.add("dragging");
  dragging = document.querySelector(".dragging");
  draggingLength = parseInt(dragging.dataset.shipLength);
  dragoverRows = null;
  dragoverColumns = null;
  dragoverIndexes = null;
  isHorizontal = isDraggingHorizontal();
  clickOffsetX = e.offsetX;
  clickOffsetY = e.offsetY;
  return [clickOffsetX, clickOffsetY];
}

function dragEnd(e) {
  dropShip();
  e.target.classList.remove("dragging");
  strategyPlayerGridItems.forEach((item) => {
    item.classList.remove("dragover");
  });
  addStartBtn();
}

function addStartBtn() {
  if (isEveryShipOnGrid()) {
    startGameBtn.classList.remove("visibility-hidden");
  }
}

function isEveryShipOnGrid() {
  return ships.every((ship) => {
    return playerGridData.some((item) => {
      return ship.dataset.shipName === item.placed;
    });
  });
}

function dragover(e, clickOffsetX, clickOffsetY) {
  e.preventDefault();
  removePreviousHover();
  const [
    draggingPositionLeft,
    draggingPositionTop,
    draggingPositionRight,
    draggingPositionBottom,
  ] = getDraggingPosition(clickOffsetX, clickOffsetY, e.clientX, e.clientY);
  const closest = getClosestGridItem(draggingPositionLeft, draggingPositionTop);
  const closestIndex = closest.index;
  changeDragoverIndexes(closestIndex);
  changeDragoverRowsAndColumns();
  if (
    isOverShip(dragoverIndexes) ||
    isOutOfGrid(
      draggingPositionLeft,
      draggingPositionTop,
      draggingPositionRight,
      draggingPositionBottom
    )
  ) {
    dragoverRows = null;
    dragoverColumns = null;
    dragoverIndexes = null;
    return;
  }
  addHover();
}

function removePreviousHover() {
  strategyPlayerGridItems.forEach((item) => {
    item.classList.remove("dragover");
  });
}

function getDraggingPosition(clickOffsetX, clickOffsetY, x, y) {
  const draggingPositionLeft = x - clickOffsetX;
  const draggingPositionTop = y - clickOffsetY;
  const draggingBox = dragging.getBoundingClientRect();
  const draggingPositionRight = draggingPositionLeft + draggingBox.width;
  const draggingPositionBottom = draggingPositionTop + draggingBox.height;
  return [
    draggingPositionLeft,
    draggingPositionTop,
    draggingPositionRight,
    draggingPositionBottom,
  ];
}

function getClosestGridItem(positionX, positionY) {
  return strategyPlayerGridItems.reduce(
    (closest, item, index) => {
      const box = item.getBoundingClientRect();
      const offsetX = Math.abs(positionX - box.left);
      const offsetY = Math.abs(positionY - box.top);
      if (offsetX <= closest.offsetX && offsetY <= closest.offsetY) {
        return { offsetX, offsetY, item, index };
      } else {
        return closest;
      }
    },
    { offsetX: Number.POSITIVE_INFINITY, offsetY: Number.POSITIVE_INFINITY }
  );
}

function changeDragoverIndexes(closestIndex) {
  dragoverIndexes = [];
  if (isHorizontal) {
    for (let i = closestIndex; i < closestIndex + draggingLength; i++) {
      dragoverIndexes.push(i);
    }
  } else {
    for (
      let i = closestIndex;
      i < closestIndex + draggingLength * GRID_SIZE;
      i = i + GRID_SIZE
    ) {
      dragoverIndexes.push(i);
    }
  }
  if (!checkIfIndexesExist(dragoverIndexes)) {
    dragoverIndexes = null;
  }
}

function isOverShip(indexes, rotate = null) {
  if (indexes == null || indexes === []) return false;
  const newindexes = [...indexes];
  if (rotate) {
    newindexes.shift();
  }
  return newindexes.some((index) => {
    return playerGridData[index].placed != null;
  });
}

function isOutOfGrid(
  draggingPositionLeft,
  draggingPositionTop,
  draggingPositionRight,
  draggingPositionBottom
) {
  const gridBox = strategyPlayerGrid.getBoundingClientRect();
  if (draggingPositionTop - gridBox.top < 0) return true;
  if (draggingPositionLeft - gridBox.left < 0) return true;
  if (draggingPositionBottom - gridBox.bottom > 0) return true;
  if (draggingPositionRight - gridBox.right > 0) return true;
  return false;
}

function changeDragoverRowsAndColumns() {
  if (!checkIfIndexesExist(dragoverIndexes)) {
    dragoverRows = null;
    dragoverColumns = null;
    return;
  }
  dragoverRows = [];
  dragoverColumns = [];
  dragoverIndexes.forEach((index) => {
    dragoverRows.push(getGridRow(index));
    dragoverColumns.push(getGridColumn(index));
  });
  dragoverRows = [...new Set(dragoverRows)];
  dragoverColumns = [...new Set(dragoverColumns)];
}

function getGridRow(index) {
  return Math.floor(index / GRID_SIZE) + 1;
}

function getGridColumn(index) {
  return (index % GRID_SIZE) + 1;
}

function addHover() {
  if (dragoverIndexes == null || dragoverIndexes == []) return;
  dragoverIndexes.forEach((index) => {
    strategyPlayerGridItems[index].classList.add("dragover");
  });
}

function dropShip() {
  if (
    dragoverRows == null ||
    dragoverColumns == null ||
    dragoverIndexes == null
  )
    return;

  addGridItems();
  removeStrategyPlaced();
  changeGridDropPosition();
  removeGridItems();
  addStrategyPlaced();
  strategyPlayerGrid.appendChild(dragging);
}

function removeGridItems() {
  dragoverIndexes.forEach((index) => {
    strategyPlayerGridItems[index].classList.add("display-none");
  });
}

function addGridItems() {
  strategyPlayerGridItems.forEach((item, index) => {
    if (playerGridData[index].placed === dragging.classList[1]) {
      item.classList.remove("display-none");
    }
  });
}

function removeStrategyPlaced() {
  playerGridData.forEach((item) => {
    if (item.placed === dragging.classList[1]) {
      item.placed = null;
    }
  });
}

function addStrategyPlaced() {
  dragoverIndexes.forEach((index) => {
    playerGridData[index].placed = dragging.classList[1];
  });
}

function changeGridDropPosition() {
  const firstRow = dragoverRows[0];
  const lastRow = dragoverRows[dragoverRows.length - 1];
  const firstColumn = dragoverColumns[0];
  const lastColumn = dragoverColumns[dragoverColumns.length - 1];
  dragging.style.gridRow = `${firstRow}/${lastRow + 1}`;
  dragging.style.gridColumn = `${firstColumn}/${lastColumn + 1}`;
}

function handleRotate() {
  rotateBtn.addEventListener("click", () => {
    if (
      dragoverIndexes == null ||
      dragoverColumns == null ||
      dragoverRows == null
    )
      return;

    const [newDragoverRows, newDragoverColumns] = getNewRotatePosition();
    const newDragoverIndexes = getIndexesFromRowsAndColumns(
      newDragoverRows,
      newDragoverColumns
    );
    const canRotate = checkIfCanBeRotated(
      newDragoverIndexes,
      newDragoverRows,
      newDragoverColumns
    );
    rotate(canRotate, newDragoverRows, newDragoverColumns, newDragoverIndexes);
  });
}

function rotate(
  canRotate,
  newDragoverRows,
  newDragoverColumns,
  newDragoverIndexes
) {
  if (canRotate) {
    isHorizontal = !isHorizontal;
    dragging.dataset.horizontal = isHorizontal.toString();
    dragoverRows = newDragoverRows;
    dragoverColumns = newDragoverColumns;
    dragoverIndexes = newDragoverIndexes;
    dropShip();
  }
}

function checkIfCanBeRotated(
  newDragoverIndexes,
  newDragoverRows,
  newDragoverColumns
) {
  let canRotate = true;
  if (
    !checkIfIndexesExist(newDragoverIndexes) ||
    !checkIfRowOrColumnExists(newDragoverRows, newDragoverColumns) ||
    isOverShip(newDragoverIndexes, true)
  ) {
    canRotate = false;
  }
  return canRotate;
}

function checkIfIndexesExist(indexes) {
  if (indexes == null) return false;
  if (
    indexes.some((index) => {
      return index >= 100;
    })
  ) {
    return false;
  }
  return true;
}

function checkIfRowOrColumnExists(rows, columns) {
  if (
    rows.some((row) => {
      return row > GRID_SIZE;
    }) ||
    columns.some((column) => {
      return column > GRID_SIZE;
    })
  ) {
    return false;
  }
  return true;
}

function getNewRotatePosition() {
  let newDragoverColumns = [];
  let newDragoverRows = [];
  if (isHorizontal) {
    for (let i = dragoverRows[0]; i < dragoverRows[0] + draggingLength; i++) {
      newDragoverRows.push(i);
    }
    newDragoverColumns = [dragoverColumns[0]];
  } else {
    for (
      let i = dragoverColumns[0];
      i < dragoverColumns[0] + draggingLength;
      i++
    ) {
      newDragoverColumns.push(i);
    }
    newDragoverRows = [dragoverRows[0]];
  }
  return [newDragoverRows, newDragoverColumns];
}

function isDraggingHorizontal() {
  if (dragging.dataset.horizontal === "true") return true;
  return false;
}

function getIndexesFromRowsAndColumns(rows, columns) {
  const indexes = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < columns.length; j++) {
      const row = rows[i];
      const column = columns[j];
      indexes.push(GRID_SIZE * (row - 1) + column - 1);
    }
  }
  indexes.sort((a, b) => {
    a - b;
  });
  return indexes;
}

function handleDeleteAll() {
  deleteAllBtn.addEventListener("click", () => {
    undropShips();
  });
}

function undropShips() {
  ships.forEach((ship) => {
    ship.style.gridRow = ``;
    ship.style.gridColumn = ``;
    dragging = null;
    ship.dataset.horizontal = "true";
    playerGridData.forEach((item) => {
      item.placed = null;
    });
    strategyPlayerGridItems.forEach((item) => {
      item.classList.remove("display-none");
    });
    shipsGrid.appendChild(ship);
    startGameBtn.classList.add("visibility-hidden");
  });
}

function handleGame() {
  displayGameSection();
  drawShipsOnPlayerGrid();
  fillComputerGrid();
  hitShipLogic();
}

function displayGameSection() {
  strategySection.classList.add("display-none");
  game.classList.remove("display-none");
}

function drawShipsOnPlayerGrid() {
  playerGridItems.forEach((item, index) => {
    if (playerGridData[index].placed !== null) {
      item.style.background = "white";
      item.style.border = "none";
    }
  });
}

function fillComputerGrid() {
  ships.forEach((ship) => {
    let shipIndexes = null;
    let shipRows = null;
    let shipColumns = null;
    while (
      !checkIfIndexesExist(shipIndexes) ||
      !checkIfRowOrColumnExists(shipRows, shipColumns) ||
      checkIfIndexesAreFilled(shipIndexes, computerGridData)
    ) {
      shipIndexes = [];
      shipRows = [];
      shipColumns = [];
      const shipLength = parseInt(ship.dataset.shipLength);
      const randomIndex = Math.floor(Math.random() * 100);
      const randomIsHorizontal = Math.random() < 0.5;
      const rowStart = getGridRow(randomIndex);
      const columnStart = getGridColumn(randomIndex);
      if (randomIsHorizontal) {
        for (let i = rowStart; i < rowStart + shipLength; i++) {
          shipRows.push(i);
        }
        shipColumns.push(columnStart);
      } else {
        for (let i = columnStart; i < columnStart + shipLength; i++) {
          shipColumns.push(i);
        }
        shipRows.push(rowStart);
      }
      shipIndexes = getIndexesFromRowsAndColumns(shipRows, shipColumns);
    }
    shipIndexes.forEach((index) => {
      computerGridData[index].placed = ship.dataset.shipName;
    });
  });
}

function checkIfIndexesAreFilled(indexes, data) {
  return indexes.some((index) => {
    return data[index].placed !== null;
  });
}

let eventListnersFunctions = [];
function hitShipLogic() {
  computerGridItems.forEach((item, index) => {
    const eventListnerFunction = () => handleClick(item, index);
    eventListnersFunctions.push(eventListnerFunction);
    item.addEventListener("click", eventListnerFunction, {
      once: true,
    });
  });
}

function handleClick(item, index) {
  playerMove(item, index);
  if (checkForWin(computerGridData)) {
    gameoverSection.classList.remove("visibility-hidden");
    gameoverModal.classList.add("active");
    gameResult.innerText = "VICTORY";
    return;
  }
  changeTurnText("Computer");
  computerGridItems.forEach((item) => {
    item.style.pointerEvents = "none";
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
    computerGridItems.forEach((item) => {
      item.style.pointerEvents = "all";
    });
  }, 1000);
}

function changeTurnText(text) {
  turnText.innerText = text;
}

function playerMove(item, index) {
  if (computerGridData[index].placed !== null) {
    computerGridData[index].hit = "success";
    item.classList.add("hit-success");
  } else {
    computerGridData[index].hit = "miss";
    item.classList.add("hit-miss");
  }
}

function computerMove() {
  let randomIndex = Math.floor(Math.random() * 100);
  while (isIndexHit(randomIndex)) {
    randomIndex = Math.floor(Math.random() * 100);
  }
  if (playerGridData[randomIndex].placed !== null) {
    playerGridData[randomIndex].hit = "success";
    playerGridItems[randomIndex].classList.add("hit-success");
  } else {
    playerGridData[randomIndex].hit = "miss";
    playerGridItems[randomIndex].classList.add("hit-miss");
  }
}

function isIndexHit(randomIndex) {
  return playerGridData[randomIndex].hit !== null;
}

function checkForWin(gridData) {
  for (let i = 0; i < gridData.length; i++) {
    if (gridData[i].placed !== null && gridData[i].hit !== "success") {
      return false;
    }
  }
  return true;
}

function restart() {
  resetDOM();
  undropShips();
  for (let i = 0; i < eventListnersFunctions.length; i++) {
    computerGridItems[i].removeEventListener(
      "click",
      eventListnersFunctions[i],
      {
        once: true,
      }
    );
  }
  resetGlobalVariables();
}

function resetDOM() {
  startGameSection.classList.remove("visibility-hidden");
  btnVSComputer.classList.remove("visibility-hidden");
  startGameHeading.classList.remove("visibility-hidden");
  strategySection.classList.add("display-none");
  game.classList.add("display-none");
  gameoverSection.classList.add("visibility-hidden");
  gameoverModal.classList.remove("active");
  playerGridItems.forEach((item) => {
    item.classList.remove("hit-miss");
    item.classList.remove("hit-success");
  });
  computerGridItems.forEach((item) => {
    item.classList.remove("hit-miss");
    item.classList.remove("hit-success");
  });
  gameResult.innerText = "";
  changeTurnText("Player");
  computerGridItems.forEach((item) => {
    item.style.pointerEvents = "all";
  });
  playerGridItems.forEach((item) => {
    item.style.background = "";
    item.style.border = "";
  });
}

function resetGlobalVariables() {
  dragoverRows = null;
  dragoverColumns = null;
  dragoverIndexes = null;
  dragging;
  isHorizontal;
  draggingLength;
  playerGridData = [];
  computerGridData = [];
  eventListnersFunctions = [];
}
