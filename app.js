const btnVSComputer = document.querySelector("#btn-vs-computer");
const startGameSection = document.querySelector("#start-game");
const startGameHeading = document.querySelector("#start-game-heading");
const strategySection = document.querySelector("#strategy-panel");
const strategyPlayerGrid = document.querySelector("#strategy-player-grid");
const strategyPlayerGridItems = [
  ...document.querySelectorAll("[data-strategy-player-grid-item]"),
];
const GRID_SIZE = 10;
let playerGridData = [];

initialisePlayerGridData();

btnVSComputer.addEventListener("click", handleStrategy);

function initialisePlayerGridData() {
  for (let i = 0; i < 100; i++) {
    playerGridData.push({ placed: null, hit: null });
  }
}

function handleStrategy() {
  displayStrategySection();
  dragAndDropShips();
}

function displayStrategySection() {
  startGameSection.classList.add("visibility-hidden");
  btnVSComputer.classList.add("visibility-hidden");
  startGameHeading.classList.add("visibility-hidden");
  strategySection.classList.remove("display-none");
}

function dragAndDropShips() {
  let clickOffsetX;
  let clickOffsetY;
  let dragoverRows;
  let dragoverColumns;
  let dragoverIndexes;
  let dragging;
  const ships = [...document.querySelectorAll("[data-ship-length]")];
  ships.forEach((ship) => {
    ship.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging");
      dragging = document.querySelector(".dragging");
      clickOffsetX = e.offsetX;
      clickOffsetY = e.offsetY;
    });
    ship.addEventListener("dragend", (e) => {
      dropShip(dragoverRows, dragoverColumns, dragoverIndexes, dragging);
      e.target.classList.remove("dragging");
      strategyPlayerGridItems.forEach((item) => {
        item.classList.remove("dragover");
      });
    });
  });
  strategyPlayerGrid.addEventListener("dragover", (e) => {
    e.preventDefault();
    const [
      draggingPositionLeft,
      draggingPositionTop,
      draggingPositionRight,
      draggingPositionBottom,
    ] = getDraggingPosition(
      clickOffsetX,
      clickOffsetY,
      e.clientX,
      e.clientY,
      dragging
    );
    const closest = getClosestGridItem(
      draggingPositionLeft,
      draggingPositionTop
    );
    const closestIndex = closest.index;
    removePreviousHover();
    const draggingLength = parseInt(dragging.dataset.shipLength);
    dragoverIndexes = getDragoverIndexes(closestIndex, draggingLength);
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
    [dragoverRows, dragoverColumns] = getDragoverRowsAndColumns(
      closestIndex,
      draggingLength
    );
    addHover(closestIndex, draggingLength);
  });
}

function isOverShip(dragoverIndexes) {
  return dragoverIndexes.some((index) => {
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

function removePreviousHover() {
  strategyPlayerGridItems.forEach((item) => {
    item.classList.remove("dragover");
  });
}

function addHover(closestIndex, draggingLength) {
  for (let i = closestIndex; i < closestIndex + draggingLength; i++) {
    strategyPlayerGridItems[i].classList.add("dragover");
  }
}

function getDraggingPosition(clickOffsetX, clickOffsetY, x, y, dragging) {
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

function getDragoverIndexes(closestIndex, draggingLength) {
  let dragoverIndexes = [];
  for (let i = closestIndex; i < closestIndex + draggingLength; i++) {
    dragoverIndexes.push(i);
  }
  return dragoverIndexes;
}

function getDragoverRowsAndColumns(closestIndex, draggingLength) {
  let dragoverRows = [];
  let dragoverColumns = [];
  for (let i = closestIndex; i < closestIndex + draggingLength; i++) {
    const row = getGridRow(i);
    const column = getGridColumn(i);
    dragoverRows.push(row);
    dragoverColumns.push(column);
  }
  dragoverRows = [...new Set(dragoverRows)];
  dragoverColumns = [...new Set(dragoverColumns)];
  return [dragoverRows, dragoverColumns];
}

function getGridRow(index) {
  return Math.floor(index / GRID_SIZE) + 1;
}

function getGridColumn(index) {
  return (index % GRID_SIZE) + 1;
}

function dropShip(dragoverRows, dragoverColumns, dragoverIndexes, dragging) {
  if (
    dragoverRows == null ||
    dragoverColumns == null ||
    dragoverIndexes == null
  )
    return;

  addGridItems(dragging);
  removeStrategyPlaced(dragging);
  changeGridDropPosition(dragoverRows, dragoverColumns, dragging);
  removeGridItems(dragoverIndexes);
  addStrategyPlaced(dragoverIndexes, dragging);
  strategyPlayerGrid.appendChild(dragging);
}

function removeGridItems(dragoverIndexes) {
  dragoverIndexes.forEach((index) => {
    strategyPlayerGridItems[index].classList.add("display-none");
  });
}

function addGridItems(dragging) {
  strategyPlayerGridItems.forEach((item, index) => {
    if (playerGridData[index].placed === dragging.classList[1]) {
      item.classList.remove("display-none");
    }
  });
}

function removeStrategyPlaced(dragging) {
  strategyPlayerGridItems.forEach((item, index) => {
    if (playerGridData[index].placed === dragging.classList[1]) {
      playerGridData[index].placed = null;
    }
  });
}

function addStrategyPlaced(dragoverIndexes, dragging) {
  dragoverIndexes.forEach((index) => {
    playerGridData[index].placed = dragging.classList[1];
  });
}

function changeGridDropPosition(dragoverRows, dragoverColumns, dragging) {
  const firstRow = dragoverRows[0];
  const lastRow = dragoverRows[dragoverRows.length - 1];
  const firstColumn = dragoverColumns[0];
  const lastColumn = dragoverColumns[dragoverColumns.length - 1];

  dragging.style.gridRow = `${firstRow}/${lastRow + 1}`;
  dragging.style.gridColumn = `${firstColumn}/${lastColumn + 1}`;
}
