"use strict";

import { setMaxRowCol, updateInfoBar, saveCaret, restoreCaret } from "./helpers.js";
import { touchToToggle, runHandler, stepHandler, stopRunning, toggleCellState } from "./handlers.js";

const cellGrid = document.getElementById("cell-grid"),
  run = document.getElementById("run"),
  step = document.getElementById("step"),
  controlButtons = document.getElementById("control-button-container"),
  modal = document.getElementById("modal"),
  alertBox = document.getElementById("alert-box");

export function setCellGrid(row, col) {
  cellGrid.innerHTML = "";
  // Help init cell grid's row and col according to document size
  if (typeof row === "undefined" || typeof col === "undefined") {
    let cellWidth, cellHeight;
    let scaler = window.screen.availWidth < 800 ? 0.06 : 0.03;
    cellWidth = cellHeight =
      Math.max(window.innerWidth, window.innerHeight) * scaler;
    cellGrid.row = ~~(cellGrid.offsetHeight / cellHeight);
    cellGrid.col = ~~(cellGrid.offsetWidth / cellWidth);
  } else {
    [cellGrid.row, cellGrid.col] = [row, col];
  }
  cellGrid.style.gridTemplateRows = `repeat(${cellGrid.row}, 1fr)`;
  cellGrid.style.gridTemplateColumns = `repeat(${cellGrid.col}, 1fr)`;
  for (let i = 0; i < cellGrid.row; i++) {
    for (let j = 0; j < cellGrid.col; j++) {
      // Each cell is represented as a span elem
      let cell = document.createElement("span");
      cell.className = "cell";
      cell.id = `${i}-${j}`;
      cellGrid.appendChild(cell);
    }
  }
  setMaxRowCol();
  document.getElementById("row").value = cellGrid.row;
  document.getElementById("col").value = cellGrid.col;
  document.getElementById("total-result").textContent =
    cellGrid.row * cellGrid.col;
}

/* initialize cell states and info bar */
export function setCells() {
  let numAlive = 0,
    numDead = 0;
  for (let cell of cellGrid.children) {
    if (Math.random() > 0.5) {
      cell.dataset.state = "alive";
      numAlive += 1;
    } else {
      cell.dataset.state = "dead";
      numDead += 1;
    }
  }
  cellGrid.alive = numAlive;
  cellGrid.dead = numDead;
  updateInfoBar();
}


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
document.addEventListener("click", event => {
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
        stopRunning();
      }
      modal.style.display = "flex";
      break;
    default:
      alertBox.style.display = "none";
  }
});
// comment: this is ugly appended code to fix the problem
//          that click events seems not to fire for <div> elements when using event delegation
modal.addEventListener("click", () => {
  modal.style.display = "none";
});

/* Add active button effect and handler to pressing Space/Arrowright key */
// for desktop
document.addEventListener("keydown", event => {
  // when input box is not focused, space performs "run"
  if (event.key === " " && document.activeElement.tagName !== "INPUT") {
    runHandler();
    // make keypress have the same visual effect as "hover"
    run.dataset.buttonState = "active";
    event.preventDefault();
  }
  // when input box is not focused, right arrow performs "step"
  if (
    event.key === "ArrowRight" &&
    document.activeElement.tagName !== "INPUT"
  ) {
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
document.getElementById("total").addEventListener("input", event => {
  let nodeId = event.target.id, // "row" or "col"
    newVal = Number(event.target.value),
    oldVal = cellGrid[nodeId];
  let error = false,
    alertMsg = document.getElementById("alert-message");

  if (oldVal === newVal) {
    event.target.value = oldVal; // avoid typing multiple zeros like "000"
    restoreCaret(event.target);
    return;
  }
  if (newVal < 0 || isNaN(newVal) || !Number.isInteger(newVal)) {
    alertMsg.textContent = "We only accept nonnegative integers ;)";
    error = true;
  }
  if (newVal > cellGrid["max" + nodeId]) {
    alertMsg.textContent = "Cell side cannot be less than 10 pixels";
    error = true;
  }

  if (error) {
    // fall back to old value
    event.target.value = oldVal;
    restoreCaret(event.target);
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
});

/* Help save and restore caret positions in case the value needs to be reset */
document.getElementById("total").addEventListener("keydown", event => {
  saveCaret(event.target);
});


setCellGrid();
setCells();