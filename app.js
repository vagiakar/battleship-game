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
let dragoverRows = null;
let dragoverColumns = null;
let dragoverIndexes = null;
let dragging;
let isHorizontal;
let draggingLength;
const GRID_SIZE = 10;
let playerGridData = [];

btnVSComputer.addEventListener("click", handleStrategy);

startGameBtn.addEventListener("click", () => {
  handleGame();
});

function handleStrategy() {
  initialisePlayerGridData();
  displayStrategySection();
  handleDragAndDropShips();
  handleRotate();
  handleDeleteAll();
}

function handleGame() {
  console.log(playerGridData);
}

function initialisePlayerGridData() {
  for (let i = 0; i < 100; i++) {
    playerGridData.push({ placed: null, hit: null });
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
  addOrRemoveStartBtn();
}

function addOrRemoveStartBtn() {
  if (isEveryShipOnGrid()) {
    startGameBtn.classList.remove("visibility-hidden");
  } else {
    startGameBtn.classList.add("visibility-hidden");
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
  if (indexes == null) return;
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
  if (dragoverIndexes == null) return;
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
    const newDragoverIndexes = getDragoverIndexesFromRowsAndColumns(
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

function getDragoverIndexesFromRowsAndColumns(
  newDragoverRows,
  newDragoverColumns
) {
  const newDragoverIndexes = [];
  for (let i = 0; i < newDragoverRows.length; i++) {
    for (let j = 0; j < newDragoverColumns.length; j++) {
      const row = newDragoverRows[i];
      const column = newDragoverColumns[j];
      newDragoverIndexes.push(GRID_SIZE * (row - 1) + column - 1);
    }
  }
  newDragoverIndexes.sort((a, b) => {
    a - b;
  });
  return newDragoverIndexes;
}

function handleDeleteAll() {
  deleteAllBtn.addEventListener("click", () => {
    ships.forEach((ship) => {
      ship.style.gridRow = ``;
      ship.style.gridColumn = ``;
      dragging = null;
      playerGridData.forEach((item) => {
        item.placed = null;
      });
      strategyPlayerGridItems.forEach((item) => {
        item.classList.remove("display-none");
      });
      shipsGrid.appendChild(ship);
      startGameBtn.classList.add("visibility-hidden");
    });
  });
}
