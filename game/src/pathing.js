// Walking routes: a breadth-first flow field from the hive over every open cell, so each pest always knows its next step and a wall can never seal the meadow.
import { GATES, GRID, HIVE_CELL } from './config.js';
import { isBlockedStatic, key } from './grid.js';

const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function isGate(c, r) { return Object.values(GATES).some(gate => gate.c === c && gate.r === r); }
function isWall(grid, c, r) {
  const station = grid.occ.get(key(c, r));
  return station?.id === 'wall' || station?.type === 'wall';
}
export function flowField(grid) {
  const field = new Map();
  const start = key(HIVE_CELL.c, HIVE_CELL.r);
  field.set(start, 0);
  const queue = [{ c: HIVE_CELL.c, r: HIVE_CELL.r }];
  for (let i = 0; i < queue.length; i += 1) {
    const { c, r } = queue[i];
    const distance = field.get(key(c, r));
    for (const [dc, dr] of DIRS) {
      const nc = c + dc; const nr = r + dr; const nk = key(nc, nr);
      if (nc < 0 || nc >= GRID.cols || nr < 0 || nr >= GRID.rows || field.has(nk)) continue;
      if ((isBlockedStatic(nc, nr) && !isGate(nc, nr)) || isWall(grid, nc, nr)) continue;
      field.set(nk, distance + 1);
      queue.push({ c: nc, r: nr });
    }
  }
  return field;
}
export function nextStep(field, grid, c, r) {
  let best = null;
  let bestDistance = field.get(key(c, r));
  for (const [dc, dr] of DIRS) {
    const nc = c + dc; const nr = r + dr;
    const distance = field.get(key(nc, nr));
    if (distance !== undefined && distance < bestDistance && !isWall(grid, nc, nr)) {
      best = { c: nc, r: nr };
      bestDistance = distance;
    }
  }
  return best;
}
export function reachable(field, c, r) { return field.has(key(c, r)); }
export function wouldSeal(grid, c, r) {
  const candidate = { occ: new Map(grid.occ) };
  candidate.occ.set(key(c, r), { id: 'wall' });
  const field = flowField(candidate);
  return Object.values(GATES).some(gate => !reachable(field, gate.c, gate.r));
}
