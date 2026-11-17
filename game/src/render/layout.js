// Screen geometry shared by the renderer, the HUD and the mouse: a 1280×800 stage, the meadow board, and the bars above and below it.
export const STAGE = { w: 1280, h: 800 };
export const BOARD = { x: 176, y: 128, w: 930, h: 496, cell: 62, cols: 15, rows: 8 };
export const HUD = { bannerY: 8, statsY: 58, rosterY: 100 };
export const BUILDBAR = { y: 640, h: 84 };
export const CONTROLS_Y = 756;
export const px = n => Math.round(n);
export const cellCentre = (c, r) => ({ x: BOARD.x + c * BOARD.cell + BOARD.cell / 2, y: BOARD.y + r * BOARD.cell + BOARD.cell / 2 });
export const cellRect = (c, r) => ({ x: BOARD.x + c * BOARD.cell, y: BOARD.y + r * BOARD.cell, w: BOARD.cell, h: BOARD.cell });
