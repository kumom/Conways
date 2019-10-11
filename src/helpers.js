"use strict";

let cellGrid = document.getElementById("cell-grid");
let aliveInfo = document.querySelector("#info-bar .alive"),
  deadInfo = document.querySelector("#info-bar .dead");

export let alive = cell => cell.className.includes("alive");
export let numInStr = str => Number(str.match(/\d+/)[0]);

export function numAliveNeighbor(i, j) {
  let row = document.getElementById("cell-grid").row,
    col = document.getElementById("cell-grid").col;
  let totalAlive = 0;

  for (let a of [(i - 1 + row) % row, i, (i + 1) % row]) {
    for (let b of [(j - 1 + col) % col, i, (j + 1) % row]) {
      let neighbor = document.getElementById(`${a}-${b}`);
      totalAlive += alive(neighbor);
    }
  }

  return totalAlive;
}

export function updateInfoBar(numAlive, numDead) {
  if (typeof numAlive === "undefined" || typeof numDead === "undefined") {
    // Number of alive/dead cells are the one that has class name "alive"/"dead" minus the one from the info bar
    numAlive = document.querySelectorAll(".alive").length - 1;
    numDead = document.querySelectorAll(".dead").length - 1;
  }
  aliveInfo.textContent = "#alive: " + numAlive;
  deadInfo.textContent = "#dead: " + numDead;
}

/* Calculate allowed max row and col */
export function setMaxRowCol() {
  let minCellSize = 10; // Cell width and height cannot be less than 10 pixels
  cellGrid.maxrow = ~~(window.innerHeight / minCellSize);
  cellGrid.maxcol = ~~(window.innerWidth / minCellSize);
}

export function resetRunningState() {
  if (cellGrid.running) {
    clearInterval(cellGrid.running);
    cellGrid.running = null;
    document.querySelector("#run .pause-icon").className = "run-icon";
    document.getElementById("run").title = "Run";
  }
}
