"use strict";

let cellGrid = document.getElementById("cell-grid");

export let isAlive = cell => cell.dataset.state === "alive";
export let mod = (n, m) => ((n % m) + m) % m;

export function numAliveNeighbor(i, j) {
  let count = 0,
    row = cellGrid.row,
    col = cellGrid.col;

  for (let a of [mod(i - 1, row), i, mod(i + 1, row)]) {
    for (let b of [mod(j - 1, col), j, mod(j + 1, col)]) {
      if (a !== i || b !== j) {
        let neighbor = document.getElementById(`${a}-${b}`);
        count += isAlive(neighbor);
      }
    }
  }

  return count;
}

export function updateInfoBar() {
  document.getElementById("alive-info").textContent =
    "#alive: " + cellGrid.alive;
  document.getElementById("dead-info").textContent = "#dead: " + cellGrid.dead;
}

/* Calculate allowed max row and col */
export function setMaxRowCol() {
  let minCellSize = 10; // Cell width and height cannot be less than 10 pixels
  cellGrid.maxrow = Math.max(~~(window.innerHeight / minCellSize), 20);
  cellGrid.maxcol = Math.max(~~(window.innerWidth / minCellSize), 20);
}

/* Caret Positioning */
export function saveCaret(target) {
  if (target.id === "row" || target.id === "col") {
    target.startOffset = target.selectionStart;
    target.endOffset = target.selectionEnd;
  }
}

export function restoreCaret(target) {
  if (target.id === "row" || target.id === "col") {
    target.selectionStart = target.startOffset;
    target.selectionEnd = target.endOffset;
  }
}
