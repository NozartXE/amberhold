// The meadow grid: which cell holds which station, and the placement rules (never on the hive, the gates or the rocks).
import { GATES, GRID, HIVE_CELL, ROCKS } from './config.js';

export function cellCentre(c, r) { return { x: GRID.x + c * GRID.cell + GRID.cell / 2, y: GRID.y + r * GRID.cell + GRID.cell / 2 }; }
export function cellAt(px, py) {
  const c = Math.floor((px - GRID.x) / GRID.cell);
  const r = Math.floor((py - GRID.y) / GRID.cell);
  return c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows ? { c, r } : null;
}
export function key(c, r) { return `${c},${r}`; }
export function createGrid() { return { occ: new Map() }; }
export function isBlockedStatic(c, r) {
  if (c < 0 || c >= GRID.cols || r < 0 || r >= GRID.rows) return true;
  if (c === HIVE_CELL.c && r === HIVE_CELL.r) return true;
  if (Object.values(GATES).some(g => g.c === c && g.r === r)) return true;
  return ROCKS.some(rock => rock.c === c && rock.r === r);
}
export function canPlace(grid, c, r) {
  return Number.isInteger(c) && Number.isInteger(r) && !isBlockedStatic(c, r) && !grid.occ.has(key(c, r));
}
export function place(grid, c, r, station) {
  if (!canPlace(grid, c, r)) return false;
  grid.occ.set(key(c, r), station);
  return true;
}
export function removeAt(grid, c, r) {
  const k = key(c, r);
  const station = grid.occ.get(k);
  if (station === undefined) return null;
  grid.occ.delete(k);
  return station;
}
