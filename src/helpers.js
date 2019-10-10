"use strict";

import { aliveColor, deadColor } from "./setting.js";

let cellGrid = document.getElementById("cell-grid");

export function numAliveNeighbor(i, j) {
  let row = document.getElementById("cell-grid").row,
    col = document.getElementById("cell-grid").col;
  let leftIdx = (j - 1 + col) % col,
    rightIdx = (j + 1) % col,
    topIdx = (i - 1 + row) % row,
    bottomIdx = (i + 1) % row;
  let left = document.getElementById(`${i}-${leftIdx}`),
    right = document.getElementById(`${i}-${rightIdx}`),
    top = document.getElementById(`${topIdx}-${j}`),
    bottom = document.getElementById(`${bottomIdx}-${j}`),
    topRight = document.getElementById(`${topIdx}-${rightIdx}`),
    topLeft = document.getElementById(`${topIdx}-${leftIdx}`),
    bottomRight = document.getElementById(`${bottomIdx}-${rightIdx}`),
    bottomLeft = document.getElementById(`${bottomIdx}-${leftIdx}`);

  return (
    left.alive +
    right.alive +
    top.alive +
    bottom.alive +
    topRight.alive +
    topLeft.alive +
    bottomRight.alive +
    bottomLeft.alive
  );
}

export function updateInfoBar(alive, dead) {
  if (!alive && !dead) {
    alive = 0;
    dead = 0;
    for (let cell of cellGrid.children) {
      if (cell.alive) {
        alive += 1;
      } else {
        dead += 1;
      }
    }
  }
  document.getElementById("alive").textContent = "#alive: " + alive;
  document.getElementById("dead").textContent = "#dead: " + dead;
  document.getElementById("col").textContent = cellGrid.col;
  document.getElementById("row").textContent = cellGrid.row;
  document.getElementById("totalRes").textContent = cellGrid.col * cellGrid.row;
}

export function toggleCellState(cell) {
  cell.alive = !cell.alive;
  cell.style.backgroundColor = cell.alive ? aliveColor : deadColor;
  // update info bar
  updateInfoBar();
}

// Help init #row and #col for different cellgrid(window) size and different cell size
export function initRowCol(cellHeight, cellWidth) {
  let row = ~~(cellGrid.offsetHeight / cellHeight),
    col = ~~(cellGrid.offsetWidth / cellWidth);
  return [row, col];
}

export function formAlertMessage(modifying) {
  if (modifying === "row") {
    return "Cell height cannot be less than 10 pixels";
  }
  if (modifying === "col") {
    return "Cell width cannot be less than 10 pixels";
  }
}

/* Calculate allowed max row and col */
export function setMaxRowCol() {
  let minCellSize = 10; // Cell width and height cannot be less than 10 pixels
  cellGrid.maxrow = ~~(window.innerHeight / minCellSize);
  cellGrid.maxcol = ~~(window.innerWidth / minCellSize);
}

export function resetRunningState() {
  clearInterval(cellGrid.running);
  cellGrid.running = null;
  document.getElementById("run-icon").src = "img/run.svg";
  document.getElementById("run").title = "Run";
}
