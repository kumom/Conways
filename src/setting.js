"use strict";

export let aliveColor = "rgb(97, 184, 121)",
  deadColor = "rgb(189, 106, 98)";

// Calculate approapte cell width and height according to the screen size
export let cellWidth, cellHeight;
cellWidth = cellHeight = Math.max(window.innerWidth, window.innerHeight) * 0.03;
if (window.screen.availWidth < 500) {
  cellWidth = cellHeight =
    Math.max(window.innerWidth, window.innerHeight) * 0.06;
}
