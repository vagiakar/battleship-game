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
  let dragoverGridIndexes;
  const ships = [...document.querySelectorAll("[data-ship-length]")];

  ships.forEach((ship) => {
    ship.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging");
      clickOffsetX = e.offsetX;
      clickOffsetY = e.offsetY;
    });

    ship.addEventListener("dragend", (e) => {
      dropShip(dragoverRows, dragoverColumns, dragoverGridIndexes);
      e.target.classList.remove("dragging");
      strategyPlayerGridItems.forEach((item) => {
        item.classList.remove("dragover");
      });
    });
  });

  strategyPlayerGrid.addEventListener("dragover", (e) => {
    e.preventDefault();
    const [positionX, positionY] = getDraggingLeftPosition(
      clickOffsetX,
      clickOffsetY,
      e.clientX,
      e.clientY
    );
    const closest = getClosestGridItem(positionX, positionY);
    const { index: closestIndex } = closest;
    removePreviousHover();
    const draggingLength = parseInt(
      document.querySelector(".dragging").dataset.shipLength
    );
    addHover(closestIndex, draggingLength);
    [
      dragoverRows,
      dragoverColumns,
      dragoverGridIndexes,
    ] = getDragoverRowsAndColumns(closestIndex, draggingLength);
  });
}

function removePreviousHover() {
  strategyPlayerGridItems.forEach((item) => {
    item.classList.remove("dragover");
  });
}

function addHover(closestIndex, draggingLength) {
  if (!isDraggingInMultipleRows(closestIndex, draggingLength)) {
    for (let i = closestIndex; i < closestIndex + draggingLength; i++) {
      strategyPlayerGridItems[i].classList.add("dragover");
    }
  }
}

function getDraggingLeftPosition(clickOffsetX, clickOffsetY, x, y) {
  const positionX = x - clickOffsetX;
  const positionY = y - clickOffsetY;

  return [positionX, positionY];
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

function getDragoverRowsAndColumns(closestIndex, draggingLength) {
  if (isDraggingInMultipleRows(closestIndex, draggingLength))
    return [null, null, null];
  let dragoverRows = [];
  let dragoverColumns = [];
  let dragoverGridIndexes = [];
  for (let i = closestIndex; i < closestIndex + draggingLength; i++) {
    const row = getGridRow(i);
    const column = getGridColumn(i);
    dragoverRows.push(row);
    dragoverColumns.push(column);
    dragoverGridIndexes.push(i);
  }
  dragoverRows = [...new Set(dragoverRows)];
  dragoverColumns = [...new Set(dragoverColumns)];
  return [dragoverRows, dragoverColumns, dragoverGridIndexes];
}

function isDraggingInMultipleRows(index, length) {
  let row = getGridRow(index);
  for (let i = index + 1; i <= index + length - 1; i++) {
    if (getGridRow(i) !== row) {
      return true;
    }
  }
  return false;
}

function getGridRow(index) {
  return Math.floor(index / GRID_SIZE) + 1;
}
function getGridColumn(index) {
  return (index % GRID_SIZE) + 1;
}

function dropShip(dragoverRows, dragoverColumns, dragoverGridIndexes) {
  if (dragoverRows == null || dragoverColumns == null) return;

  const dragging = document.querySelector(".dragging");

  addGridItems(dragging);
  removeStrategyPlaced(dragging);

  changeGridDropPosition(dragoverRows, dragoverColumns, dragging);
  removeGridItems(dragoverGridIndexes);
  addStrategyPlaced(dragoverGridIndexes, dragging);

  strategyPlayerGrid.appendChild(dragging);
}
function removeGridItems(dragoverGridIndexes) {
  dragoverGridIndexes.forEach((index) => {
    strategyPlayerGridItems[index].classList.add("display-none");
  });
}

function addGridItems(dragging) {
  strategyPlayerGridItems.forEach((item, index) => {
    if (
      item.dataset.placed === "true" &&
      playerGridData[index].placed === dragging.classList[1]
    ) {
      item.classList.remove("display-none");
    }
  });
}

function removeStrategyPlaced(dragging) {
  strategyPlayerGridItems.forEach((item, index) => {
    if (
      item.dataset.placed === "true" &&
      playerGridData[index].placed === dragging.classList[1]
    ) {
      item.dataset.placed = "false";
      playerGridData[index].placed = null;
    }
  });
}

function addStrategyPlaced(dragoverGridIndexes, dragging) {
  dragoverGridIndexes.forEach((index) => {
    strategyPlayerGridItems[index].dataset.placed = "true";
    playerGridData[index].placed = dragging.classList[1];
  });
}

function changeGridDropPosition(dragoverRows, dragoverColumns, dragging) {
  if (dragoverRows.length === 1) {
    dragging.style.gridRow = `${dragoverRows[0]}/${dragoverRows[0] + 1}`;
  } else {
    dragging.style.gridRow = `${dragoverRows[0]}/${
      dragoverRows[dragoverRows.length - 1] + 1
    }`;
  }
  if (dragoverColumns.length === 1) {
    dragging.style.gridColumn = `${dragoverColumns[0]}/${
      dragoverColumns[0] + 1
    }`;
  } else {
    dragging.style.gridColumn = `${dragoverColumns[0]}/${
      dragoverColumns[dragoverColumns.length - 1] + 1
    }`;
  }
}
