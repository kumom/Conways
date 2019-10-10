"use strict";

import {
  numAliveNeighbor,
  updateInfoBar,
  formAlertMessage,
  setMaxRowCol,
  toggleCellState,
  resetRunningState
} from "./helpers.js";
import { aliveColor, deadColor } from "./setting.js";
import { initCellGrid, fillCellGrid } from "./init.js";

let cellGrid = document.getElementById("cell-grid");
let run = document.getElementById("run"),
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
// Solution from: https://stackoverflow.com/questions/3918842/how-to-find-out-the-actual-event-target-of-touchmove-javascript-event
cellGrid.addEventListener("touchmove", event => {
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
});

cellGrid.addEventListener("touchstart", event => {
  event.preventDefault();
});

/* Delegated handler for click events */
window.addEventListener("click", event => {
  if (event.target.id === "step") {
    stepHandler(event);
  }

  if (event.target.id === "run") {
    runHandler(event);
  }

  if (event.target.id === "restart") {
    initCellGrid();
  }

  // If the user clicks the area outside the modal window, close it
  if (event.target !== modal) {
    if (event.target.id === "about") {
      let hidden = modal.style.display === "none";
      modal.style.display = hidden ? "grid" : "none";
    } else {
      modal.style.display = "none";
    }
  }

  // If the user clicks close button the area outside the alert window, close it
  if (event.target !== alertBox) {
    alertBox.style.display = "none";
  }
});

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

// equivalent with keydown event for mobile
controlButtons.addEventListener("touchstart", event => {
  event.preventDefault();
  if (event.target.className.includes("control-button")) {
    event.target.classList.add("active-button");
  }
});

window.addEventListener("keyup", event => {
  // make keypress have the same visual effect as "hover"
  if (event.key === " ") {
    run.classList.remove("active-button");
  }

  if (event.key === "ArrowRight") {
    step.classList.remove("active-button");
  }
});

// equivalent with keyup event for mobile
controlButtons.addEventListener("touchend", () => {
  event.preventDefault();
  for (let node of controlButtons.children) {
    if (node.className.includes("control-button")) {
      node.classList.remove("active-button");
    }
  }
});
controlButtons.addEventListener("touchcancel", () => {
  event.preventDefault();
  for (let node of controlButtons.children) {
    if (node.className.includes("control-button")) {
      node.classList.remove("active-button");
    }
  }
});

/* Adjust allowed max row and col if window size changes */
window.addEventListener("resize", setMaxRowCol);

function stepHandler(event) {
  let deadSoon = [],
    aliveSoon = [];

  for (let i = 0; i < cellGrid.row; i++) {
    for (let j = 0; j < cellGrid.col; j++) {
      let cell = document.getElementById(`${i}-${j}`);
      let x = numAliveNeighbor(i, j);

      if (cell.alive) {
        if (x < 2 || x > 3) {
          deadSoon.push(cell);
        }
      } else {
        if (x === 3) {
          aliveSoon.push(cell);
        }
      }
    }
  }

  for (let cell of deadSoon) {
    cell.alive = false;
    cell.style.backgroundColor = deadColor;
  }

  for (let cell of aliveSoon) {
    cell.alive = true;
    cell.style.backgroundColor = aliveColor;
  }

  // update info bar
  let aliveBefore = Number(
    document.getElementById("alive").textContent.match(/\d+/)[0]
  );

  let deadBefore = Number(
    document.getElementById("dead").textContent.match(/\d+/)[0]
  );
  let alive = aliveBefore - deadSoon.length + aliveSoon.length;
  let dead = deadBefore - aliveSoon.length + deadSoon.length;
  updateInfoBar(alive, dead);

  // clean up for the next round
  deadSoon = [];
  aliveSoon = [];
}

function runHandler(event) {
  if (cellGrid.running) {
    resetRunningState();
  } else {
    cellGrid.running = setInterval(stepHandler, 500);
    document.getElementById("run-icon").src = "img/pause.svg";
    run.title = "Pause";
  }
}

/* Handler for input #row and #col */

function gridSizeHandler(event) {
  let nodeId = event.target.id, // "row" or "col"
    newVal = Number(event.target.textContent),
    oldVal = cellGrid[nodeId];
  if (isNaN(newVal) || oldVal === newVal || newVal > cellGrid["max" + nodeId]) {
    event.target.textContent = cellGrid[nodeId];
    // show alert box
    if (newVal > cellGrid["max" + nodeId]) {
      alertBox.style.display = "grid";
      alertMsg.textContent = formAlertMessage(nodeId);
      // alert box disappears after 2000ms
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 2000);
    }
  } else {
    cellGrid[nodeId] = newVal;
    fillCellGrid(cellGrid.row, cellGrid.col);
    initCellGrid();
  }
}

total.addEventListener("input", gridSizeHandler);
