"use strict";

import {
  numAliveNeighbor,
  setMaxRowCol,
  isAlive,
  updateInfoBar
} from "./helpers.js";
import { setCellGrid, setCells } from "./init.js";

let cellGrid = document.getElementById("cell-grid"),
  run = document.getElementById("run"),
  step = document.getElementById("step"),
  controlButtons = document.getElementById("control-button-container"),
  modal = document.getElementById("modal"),
  alertBox = document.getElementById("alert-box");

/* Handling cell state toggle */
["mousedown", "mouseover"].forEach(eventType => {
  cellGrid.addEventListener(eventType, event => {
    if (event.target.className === "cell") {
      if (eventType === "mousedown" || event.buttons === 1) {
        toggleCellState(event.target);
      }
    }
  });
});
["touchmove", "touchstart"].forEach(eventType => {
  cellGrid.addEventListener(eventType, event => {
    if (event.target.className === "cell") {
      // equivalent with cellGrid mousedown/mouseover but for mobile
      // solution from: https://stackoverflow.com/questions/3918842/how-to-find-out-the-actual-event-target-of-touchmove-javascript-event
      // comment: for me this is the safest solution for devices that have both a mouse and a touchscreen
      touchToToggle(event);
    }
  });
});

/* Delegated handler for click/tap events */
window.addEventListener("click", event => {
  switch (event.target.id) {
    case "step":
      stepHandler(event);
      break;
    case "run":
      runHandler();
      break;
    case "restart":
      if (cellGrid.running) {
        stopRunning();
      }
      setCells();
      break;
    case "about":
      if (cellGrid.running) {
      }
      modal.style.display = "flex";
      break;
    default:
      modal.style.display = "none";
      alertBox.style.display = "none";
  }
});

/* Add active button effect and handler to pressing Space/Arrowright key */
// for desktop
document.addEventListener("keydown", event => {
  // when input box is not focused, space performs "run"
  if (event.key === " " && !document.activeElement.isContentEditable) {
    runHandler();
    // make keypress have the same visual effect as "hover"
    run.dataset.buttonState = "active";
    event.preventDefault();
  }
  // when input box is not focused, right arrow performs "step"
  if (event.key === "ArrowRight" && !document.activeElement.isContentEditable) {
    stepHandler(event);
    // make keypress have the same visual effect as "hover"
    step.dataset.buttonState = "active";
    event.preventDefault();
  }
});
// for mobile
controlButtons.addEventListener("touchstart", event => {
  if (event.target.className === "control-button") {
    event.target.dataset.buttonState = "active";
  }
});

/* Remove active button effect */
// for desktop
document.addEventListener("keyup", event => {
  // make keypress have the same visual effect as "hover"
  if (event.key === " ") {
    run.dataset.buttonState = "inactive";
  }

  if (event.key === "ArrowRight") {
    step.dataset.buttonState = "inactive";
  }
});
// for mobile
["touchend", "touchcancel"].forEach(eventType => {
  controlButtons.addEventListener(eventType, () => {
    for (let node of controlButtons.children) {
      if (node.className === "control-button") {
        node.dataset.buttonState = "inactive";
      }
    }
  });
});

/* Adjust allowed max row and col if document size changes */
document.addEventListener("resize", setMaxRowCol);

/* Clean up current cell grid and set up a new one */
document.getElementById("total").addEventListener("input", gridSizeHandler);

function toggleCellState(cell) {
  // check it's indeed a cell instead of the cell grid
  if (cell.className === "cell") {
    let deadSoon = isAlive(cell),
      aliveSoon = !deadSoon;
    cell.dataset.state = deadSoon ? "dead" : "alive";
    cellGrid.alive += aliveSoon - deadSoon;
    cellGrid.dead += deadSoon - aliveSoon;
    // update info bar
    updateInfoBar();
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

  for (let cell of cellGrid.children) {
    let [i, j] = cell.id.match(/\d/g),
      x = numAliveNeighbor(Number(i), Number(j));
    if (isAlive(cell) && (x < 2 || x > 3)) {
      deadSoon.push(cell);
    }
    if (!isAlive(cell) && x === 3) {
      aliveSoon.push(cell);
    }
  }

  for (let cell of deadSoon.concat(aliveSoon)) {
    toggleCellState(cell);
  }

  // clean up for the next round
  deadSoon = [];
  aliveSoon = [];
}

function runHandler() {
  // It basically toggles the current running state
  if (cellGrid.running) {
    stopRunning();
  } else {
    startRunning();
  }
}

function stopRunning() {
  clearInterval(cellGrid.running);
  cellGrid.running = null;
  document.querySelector("#run .pause-icon").className = "run-icon";
  document.getElementById("run").title = "Run";
}

function startRunning() {
  cellGrid.running = setInterval(stepHandler, 500);
  document.querySelector("#run .run-icon").className = "pause-icon";
  run.title = "Pause";
}

function gridSizeHandler(event) {
  let nodeId = event.target.id, // "row" or "col"
    newVal = Number(event.target.textContent),
    oldVal = cellGrid[nodeId];
  let error = false,
    alertMsg = document.getElementById("alert-message");

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
    if (cellGrid.running) {
      stopRunning();
    }
    cellGrid[nodeId] = newVal;
    setCellGrid(cellGrid.row, cellGrid.col);
    setCells();
  }
}
