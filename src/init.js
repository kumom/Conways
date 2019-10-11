"use strict";

import { setMaxRowCol, updateInfoBar } from "./helpers.js";

let cellGrid = document.getElementById("cell-grid");

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
  document.getElementById("row").textContent = cellGrid.row;
  document.getElementById("col").textContent = cellGrid.col;
  document.getElementById("total-result").textContent =
    cellGrid.row * cellGrid.col;
}

/* initialize cell states and info bar */
export function setCells() {
  let alive = 0,
    dead = 0;
  for (let cell of cellGrid.children) {
    if (Math.random() > 0.5) {
      cell.dataset.state = "alive";
      alive += 1;
    } else {
      cell.dataset.state = "dead";
      dead += 1;
    }
    cellGrid.alive = alive;
    cellGrid.dead = dead;
    updateInfoBar();
  }
}

setCellGrid();
setCells();
