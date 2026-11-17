// Pest behaviour: ants and mites follow the flow field, wasps fly straight at the hive, hornborers chew through wax, and Vespa spawns her own wasps.
import { GRID, HIVE_CELL, PESTS } from './config.js';
import { cellCentre, key } from './grid.js';
import { flowField, nextStep } from './pathing.js';
import { hpFor } from './waves.js';

export function spawnPest(sim, pestId, at) {
  const spec = PESTS[pestId];
  const gate = at ?? sim.gateCell;
  const cell = gate.c !== undefined ? cellCentre(gate.c, gate.r) : null;
  return { id: sim.nextPestId++, kind: pestId, x: cell ? (cell.x - GRID.x) / GRID.cell : gate.x, y: cell ? (cell.y - GRID.y) / GRID.cell : gate.y, hp: hpFor(pestId, sim.flow, sim.difficulty), maxHp: hpFor(pestId, sim.flow, sim.difficulty), speed: spec.speed, slowUntil: 0, slowFactor: 1, stunUntil: 0, chewTarget: null, spawnTimer: spec.spawnPeriod ?? 0, enraged: false, reached: false, wob: sim.rng.next(), leak: spec.leak };
}
export function pestsInRadius(sim, x, y, radiusCells) { return sim.pests.filter(p => p.hp > 0 && !p.reached && Math.hypot(p.x - x, p.y - y) <= radiusCells); }
export function stepPests(sim, dt) {
  const field = flowField(sim.grid);
  for (const p of sim.pests) {
    if (p.hp <= 0 || p.reached) continue;
    if (p.stunUntil > sim.time) continue;
    const speed = p.speed * (p.slowUntil > sim.time ? p.slowFactor : 1);
    if (p.kind === 'vespa') {
      p.spawnTimer -= dt;
      if (p.spawnTimer <= 0) { sim.queueSpawn('wasp', { x: p.x, y: p.y }); p.spawnTimer += PESTS.vespa.spawnPeriod; }
      if (!p.enraged && p.hp <= p.maxHp / 2) { p.enraged = true; p.speed *= PESTS.vespa.enrageSpeed; sim.events.push({ type: 'enrage' }); }
    }
    const flying = PESTS[p.kind].flying;
    const hx = HIVE_CELL.c + 0.5; const hy = HIVE_CELL.r + 0.5;
    if (flying) {
      const d = Math.hypot(hx - p.x, hy - p.y);
      if (d) { p.x += (hx - p.x) / d * speed * dt; p.y += (hy - p.y) / d * speed * dt; }
    } else {
      let guard = 0;
      while (guard++ < 3) {
        const c = Math.max(0, Math.min(GRID.cols - 1, Math.floor(p.x)));
        const r = Math.max(0, Math.min(GRID.rows - 1, Math.floor(p.y)));
        const posKey = key(c, r);
        if (!field.has(posKey)) {
          const adjacent = [...sim.grid.occ.values()].find(st => (st.kind === 'wall' || st.id === 'wall') && Math.abs(st.c - c) + Math.abs(st.r - r) === 1);
          if (adjacent) { p.chewTarget = adjacent; adjacent.hp -= 10 * dt; if (adjacent.hp <= 0) { sim.grid.occ.delete(key(adjacent.c, adjacent.r)); sim.stations = sim.stations.filter(s => s !== adjacent); p.chewTarget = null; } }
          break;
        }
        const next = nextStep(field, sim.grid, c, r);
        if (!next) break;
        p.chewTarget = null;
        const tx = next.c + 0.5; const ty = next.r + 0.5;
        const dx = tx - p.x; const dy = ty - p.y; const d = Math.hypot(dx, dy);
        const move = speed * dt;
        if (d <= 0.05 || d <= move) { p.x = tx; p.y = ty; continue; }
        p.x += dx / d * move; p.y += dy / d * move; break;
      }
    }
    if (Math.hypot(hx - p.x, hy - p.y) <= 0.35) { sim.leak(p); p.reached = true; }
  }
  sim.pests = sim.pests.filter(p => p.hp > 0 || p.reached);
}
