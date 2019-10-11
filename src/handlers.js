"use strict";

import {
  numAliveNeighbor,
  setMaxRowCol,
  resetRunningState,
  alive,
  numInStr,
  updateInfoBar
} from "./helpers.js";
import { setCellGrid, setCells } from "./init.js";

let cellGrid = document.getElementById("cell-grid"),
  aliveInfo = document.querySelector("#info-bar .alive"),
  deadInfo = document.querySelector("#info-bar .dead"),
  run = document.getElementById("run"),
  step = document.getElementById("step"),
  controlButtons = document.getElementById("control-button-container"),
  modal = document.getElementById("modal"),
  alertBox = document.getElementById("alert-box"),
  alertMsg = document.getElementById("alert-message"),
  total = document.getElementById("total");

/* Delegated handler for cells */
cellGrid.addEventListener("mousedown", event => {
  toggleCellState(event.target);
});
cellGrid.addEventListener("mouseover", event => {
  if (event.buttons == 1) {
    toggleCellState(event.target);
  }
});
// equivalent with cellGrid mousedown/mouseover but for mobile
// solution from: https://stackoverflow.com/questions/3918842/how-to-find-out-the-actual-event-target-of-touchmove-javascript-event
cellGrid.addEventListener("touchmove", touchToToggle);
cellGrid.addEventListener("touchstart", touchToToggle);

/* Delegated handler for click events */
window.addEventListener("click", event => {
  if (event.target.id === "step") {
    stepHandler(event);
  }

  if (event.target.id === "run") {
    runHandler(event);
  }

  if (event.target.id === "restart") {
    setCells();
  }

  // If the user clicks the area outside the modal window, close it
  if (event.target !== modal) {
    if (event.target.id === "about") {
      let hidden = modal.style.display === "none";
      if (hidden) {
        modal.style.display = "flex";
        resetRunningState();
      } else {
        modal.style.display = "none";
      }
    } else {
      modal.style.display = "none";
    }
  }

  // If the user clicks close button the area outside the alert window, close it
  if (event.target !== alertBox) {
    alertBox.style.display = "none";
  }

  if (event.target.className === "popup") {
    event.target.style.display = "none";
  }
});

/* Add .active-button effect and handler to pressing Space/Arrowright key */
// for desktop
window.addEventListener("keydown", event => {
  // when input box is not focused, space performs "run"
  if (event.key === " " && !document.activeElement.isContentEditable) {
    runHandler(event);
    // make keypress have the same visual effect as "hover"
    run.classList.add("active-button");
    event.preventDefault();
  }
  // when input box is not focused, right arrow performs "step"
  if (event.key === "ArrowRight" && !document.activeElement.isContentEditable) {
    stepHandler(event);
    // make keypress have the same visual effect as "hover"
    step.classList.add("active-button");
    event.preventDefault();
  }
});
// for mobile
controlButtons.addEventListener("touchstart", event => {
  if (event.target.className.includes("control-button")) {
    event.target.classList.add("active-button");
  }
});

/* Remove .active-button effect */
// for desktop
window.addEventListener("keyup", event => {
  // make keypress have the same visual effect as "hover"
  if (event.key === " ") {
    run.classList.remove("active-button");
  }

  if (event.key === "ArrowRight") {
    step.classList.remove("active-button");
  }
});
// for mobile
controlButtons.addEventListener("touchend", () => {
  for (let node of controlButtons.children) {
    if (node.className.includes("control-button")) {
      node.classList.remove("active-button");
    }
  }
});
controlButtons.addEventListener("touchcancel", () => {
  for (let node of controlButtons.children) {
    if (node.className.includes("control-button")) {
      node.classList.remove("active-button");
    }
  }
});

/* Adjust allowed max row and col if window size changes */
window.addEventListener("resize", setMaxRowCol);

/* Clean up current cell grid and set up a new one */
total.addEventListener("input", gridSizeHandler);

function toggleCellState(cell) {
  // check it's indeed a cell instead of the cell grid
  if (cell.className.includes("cell")) {
    let deadSoon = alive(cell),
      aliveSoon = !deadSoon,
      numAlive = numInStr(aliveInfo.textContent) - deadSoon + aliveSoon,
      numDead = numInStr(deadInfo.textContent) + deadSoon - aliveSoon;
    let currentState = alive(cell) ? "alive" : "dead",
      nextState = alive(cell) ? "dead" : "alive";
    cell.classList.add(nextState);
    cell.classList.remove(currentState);
    // update info bar
    updateInfoBar(numAlive, numDead);
  }
}

function touchToToggle(event) {
  // get coordinates depending on pointer type:
  let xcoord = event.touches ? event.touches[0].pageX : event.pageX,
    ycoord = event.touches ? event.touches[0].pageY : event.pageY;
  // get element in coordinates:
  let target = document.elementFromPoint(xcoord, ycoord);
  if (target !== cellGrid.lastTouchedTarget) {
    toggleCellState(target);
    cellGrid.lastTouchedTarget = target;
  }
  event.preventDefault();
}

function stepHandler(event) {
  let deadSoon = [],
    aliveSoon = [];

  for (let i = 0; i < cellGrid.row; i++) {
    for (let j = 0; j < cellGrid.col; j++) {
      let cell = document.getElementById(`${i}-${j}`);
      let x = numAliveNeighbor(i, j);
      if (alive(cell) && (x < 2 || x > 3)) {
        deadSoon.push(cell);
      }
      if (!alive(cell) && x === 3) {
        aliveSoon.push(cell);
      }
    }
  }

  for (let cell of deadSoon.concat(aliveSoon)) {
    toggleCellState(cell);
  }

  // clean up for the next round
  deadSoon = [];
  aliveSoon = [];
}

function runHandler(event) {
  if (cellGrid.running) {
    resetRunningState();
  } else {
    cellGrid.running = setInterval(stepHandler, 500);
    document.querySelector("#run .run-icon").className = "pause-icon";
    run.title = "Pause";
  }
}

function gridSizeHandler(event) {
  let nodeId = event.target.id, // "row" or "col"
    newVal = Number(event.target.textContent),
    oldVal = cellGrid[nodeId],
    error = false;

  if (oldVal === newVal) return;
  if (isNaN(newVal) || newVal < 0) {
    alertMsg.textContent = "We only accept nonnegative numbers ;)";
    error = true;
  }
  if (newVal > cellGrid["max" + nodeId]) {
    alertMsg.textContent = "Cell " + nodeId + " cannot be less than 10 pixels";
    error = true;
  }
  if (error) {
    // fall back to old value
    event.target.textContent = oldVal;
    // show alert box and make it disappear after 2000ms
    alertBox.style.display = "flex";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 2000);
  } else {
    cellGrid[nodeId] = newVal;
    setCellGrid(cellGrid.row, cellGrid.col);
    setCells();
  }
}
