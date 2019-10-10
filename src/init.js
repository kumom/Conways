"use strict";

import { aliveColor, deadColor, cellHeight, cellWidth } from "./setting.js";
import {
  initRowCol,
  setMaxRowCol,
  updateInfoBar,
  resetRunningState
} from "./helpers.js";

let cellGrid = document.getElementById("cell-grid");

export function fillCellGrid(row, col) {
  cellGrid.innerHTML = "";
  if (!row && !col) {
    [cellGrid.row, cellGrid.col] = initRowCol(cellHeight, cellWidth);
    [row, col] = [cellGrid.row, cellGrid.col];
  }
  cellGrid.style.gridTemplateRows = `repeat(${row}, 1fr)`;
  cellGrid.style.gridTemplateColumns = `repeat(${col}, 1fr)`;

  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      // Each cell is represented as a span elem
      let cell = document.createElement("span");
      cell.className = "cell";
      cell.id = `${i}-${j}`;
      cellGrid.appendChild(cell);
    }
  }
}

/* Configure cell grid and info bar */
export function initCellGrid() {
  setMaxRowCol();
  resetRunningState();
  let alive = 0,
    dead = 0;
  for (let cell of cellGrid.childNodes) {
    let aliveProb = Math.random();
    cell.alive = aliveProb > 0.5 ? true : false;
    cell.style.backgroundColor = cell.alive ? aliveColor : deadColor;
    if (cell.alive) {
      alive += 1;
    } else {
      dead += 1;
    }
  }
  updateInfoBar(alive, dead);
}

fillCellGrid();
initCellGrid();
