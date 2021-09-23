"use strict";

import {
  numAliveNeighbor,
  isAlive,
  updateInfoBar,
} from "./helpers.js";

export function toggleCellState(cell) {
  const cellGrid = document.getElementById("cell-grid");

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

export function touchToToggle(event) {
  const cellGrid = document.getElementById("cell-grid");

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

export function stepHandler(event) {
  const cellGrid = document.getElementById("cell-grid");

  let deadSoon = [],
    aliveSoon = [];

  for (let cell of cellGrid.children) {
    let [i, j] = cell.id.match(/\d+/g);
    let x = numAliveNeighbor(Number(i), Number(j));
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

function startRunning() {
  const run = document.getElementById("run"), cellGrid = document.getElementById("cell-grid");

  cellGrid.running = setInterval(stepHandler, 500);
  document.querySelector("#run .run-icon").className = "pause-icon";
  run.title = "Pause";
}

export function runHandler() {
  const cellGrid = document.getElementById("cell-grid");

  // It basically toggles the current running state
  if (cellGrid.running) {
    stopRunning();
  } else {
    startRunning();
  }
}

export function stopRunning() {
  const run = document.getElementById("run"), cellGrid = document.getElementById("cell-grid");

  clearInterval(cellGrid.running);
  cellGrid.running = null;
  document.querySelector("#run .pause-icon").className = "run-icon";
  run.title = "Run";
}

