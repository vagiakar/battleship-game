import {
  strategyPlayerGrid,
  playerGridData,
  GRID_SIZE,
  isOverShip,
  ships,
  startGameBtn,
  shipsGrid,
} from "./app.js";
import { isHorizontal, setHorizontal } from "./rotate.js";
export let dragoverPosition = null;
export let draggingLength = 0;
export let dragging = null;

export function dragStart(e) {
  dragoverPosition = null;
  e.target.classList.add("dragging");
  dragging = document.querySelector(".dragging");
  draggingLength = parseInt(dragging.dataset.shipLength);
  setHorizontal();
}

export function dragEnd(e) {
  dropShip();
  e.target.classList.remove("dragging");
  removePreviousHover();
  if (isEveryShipOnGrid()) {
    addStartBtn();
  }
}

function addStartBtn() {
  startGameBtn.classList.remove("visibility-hidden");
}

function isEveryShipOnGrid() {
  return ships.every((ship) => {
    return playerGridData.some((row) => {
      return row.some((item) => {
        return ship.dataset.shipName === item.placed;
      });
    });
  });
}

export function dragover(e, clickOffsetX, clickOffsetY) {
  e.preventDefault();
  removePreviousHover();
  const [
    draggingPositionLeft,
    draggingPositionTop,
    draggingPositionRight,
    draggingPositionBottom,
  ] = getDraggingPosition(clickOffsetX, clickOffsetY, e.clientX, e.clientY);
  const closest = getClosestGridItem(draggingPositionLeft, draggingPositionTop);
  changeDragoverRowsAndColumns(closest.row, closest.column);
  if (
    isOutOfGrid(
      draggingPositionLeft,
      draggingPositionTop,
      draggingPositionRight,
      draggingPositionBottom
    ) ||
    isOverShip(dragoverPosition)
  ) {
    dragoverPosition = null;
    return;
  }
  addHover();
}

function removePreviousHover() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      playerGridData[x][y].element.classList.remove("dragover");
    }
  }
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
  return playerGridData.flat().reduce(
    (closest, item) => {
      const box = item.element.getBoundingClientRect();
      const offsetX = Math.abs(positionX - box.left);
      const offsetY = Math.abs(positionY - box.top);
      if (offsetX <= closest.offsetX && offsetY <= closest.offsetY) {
        return {
          offsetX,
          offsetY,
          row: item.row,
          column: item.column,
        };
      } else {
        return closest;
      }
    },
    { offsetX: Number.POSITIVE_INFINITY, offsetY: Number.POSITIVE_INFINITY }
  );
}

function changeDragoverRowsAndColumns(row, column) {
  dragoverPosition = [];
  if (isHorizontal) {
    for (let i = 0; i < draggingLength; i++) {
      dragoverPosition.push({ row, column: column + i });
    }
  } else {
    for (let i = 0; i < draggingLength; i++) {
      dragoverPosition.push({ row: row + i, column });
    }
  }
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

function addHover() {
  if (dragoverPosition === null) return;
  for (let i = 0; i < dragoverPosition.length; i++) {
    playerGridData[dragoverPosition[i].row - 1][
      dragoverPosition[i].column - 1
    ].element.classList.add("dragover");
  }
}

export function dropShip() {
  if (dragoverPosition === null) return;
  addGridItems();
  removeStrategyPlaced();
  /*
    position.x = 0;
    position.y = 0;
    dragging.style.transform = `translate(0px, 0px)`;
    */
  changeGridDropPosition();
  removeGridItems();
  addStrategyPlaced();
  strategyPlayerGrid.appendChild(dragging);
}

function removeGridItems() {
  dragoverPosition.forEach((position) => {
    playerGridData[position.row - 1][position.column - 1].element.classList.add(
      "display-none"
    );
  });
}

function addGridItems() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (playerGridData[x][y].placed === dragging.dataset.shipName) {
        playerGridData[x][y].element.classList.remove("display-none");
      }
    }
  }
}

function removeStrategyPlaced() {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (playerGridData[x][y].placed === dragging.dataset.shipName) {
        playerGridData[x][y].placed = null;
      }
    }
  }
}

function addStrategyPlaced() {
  dragoverPosition.forEach((position) => {
    playerGridData[position.row - 1][position.column - 1].placed =
      dragging.dataset.shipName;
  });
}

function changeGridDropPosition() {
  const firstRow = dragoverPosition[0].row;
  const lastRow = dragoverPosition[dragoverPosition.length - 1].row;
  const firstColumn = dragoverPosition[0].column;
  const lastColumn = dragoverPosition[dragoverPosition.length - 1].column;
  dragging.style.gridRow = `${firstRow}/${lastRow + 1}`;
  dragging.style.gridColumn = `${firstColumn}/${lastColumn + 1}`;
}

export function undropShips() {
  ships.forEach((ship) => {
    ship.style.gridRow = ``;
    ship.style.gridColumn = ``;
    dragging = null;
    dragoverPosition = null;
    ship.dataset.horizontal = "true";
    playerGridData.forEach((row) => {
      row.forEach((item) => {
        item.placed = null;
        item.element.classList.remove("display-none");
      });
    });
    shipsGrid.appendChild(ship);
    startGameBtn.classList.add("visibility-hidden");
  });
}

export function setDragoverPosition(newDragoverPosition) {
  dragoverPosition = newDragoverPosition;
}
export function resetDragging() {
  dragging = null;
}
export function resetDraggingLength() {
  draggingLength = 0;
}
