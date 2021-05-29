import {
  dragoverPosition,
  dragging,
  dropShip,
  draggingLength,
  setDragoverPosition,
} from "./dragAndDrop.js";
import { checkIfRowOrColumnExists, isOverShip } from "./app.js";
export let isHorizontal;
export function handleRotate() {
  if (dragoverPosition === null) return;
  const newRotatePosition = getNewRotatePosition();
  const canRotate = checkIfCanBeRotated(newRotatePosition);
  rotate(canRotate, newRotatePosition);
}

function getNewRotatePosition() {
  let newDragoverPosition = [];
  if (isHorizontal) {
    for (let i = 0; i < draggingLength; i++) {
      newDragoverPosition.push({
        row: dragoverPosition[0].row + i,
        column: dragoverPosition[0].column,
      });
    }
  } else {
    for (let i = 0; i < draggingLength; i++) {
      newDragoverPosition.push({
        row: dragoverPosition[0].row,
        column: dragoverPosition[0].column + i,
      });
    }
  }
  return newDragoverPosition;
}

function checkIfCanBeRotated(newRotatePosition) {
  let canRotate = true;
  if (
    !checkIfRowOrColumnExists(newRotatePosition) ||
    isOverShip(newRotatePosition, true)
  ) {
    canRotate = false;
  }
  return canRotate;
}

function rotate(canRotate, newDragoverPosition) {
  if (canRotate) {
    isHorizontal = !isHorizontal;
    dragging.dataset.horizontal = isHorizontal.toString();
    setDragoverPosition(newDragoverPosition);
    dropShip();
  }
}

export function setHorizontal() {
  if (dragging.dataset.horizontal === "true") {
    isHorizontal = true;
  } else {
    isHorizontal = false;
  }
}
export function resetHorizontal() {
  isHorizontal = true;
}
