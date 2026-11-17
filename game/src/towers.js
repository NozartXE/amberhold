// The five stations at work: targeting, firing, the bell's ring, upgrades and selling — every number read from config so the balance tool can tune them.
import { TOWERS } from './config.js';
import { cellCentre, key } from './grid.js';
import { pestsInRadius } from './enemies.js';
import { damage } from './combat.js';
export function makeStation(sim, towerId, c, r) {
  const spec = TOWERS.find(t => t.id === towerId); if (!spec) return null;
  const st = { id: sim.nextStationId++, kind: towerId, c, r, level: 1, invested: spec.cost, cooldown: 0, ringTimer: spec.period ?? 0 };
  if (towerId === 'wall') st.hp = spec.hp * (sim.boons.has('wax') ? 1 + 150 / spec.hp : 1);
  return st;
}
export function stationStats(sim, st) {
  const spec = TOWERS.find(t => t.id === st.kind); const mult = [1, 1.6, 2.5][st.level - 1] ?? 2.5;
  return { dmg: spec.dmg * mult * (sim.boons.has('pollen') ? 1.2 : 1), range: spec.range + 0.3 * (st.level - 1) + (sim.boons.has('reach') ? 0.4 : 0), rate: spec.rate * (sim.boons.has('busy') ? 1.15 : 1), period: 1 / (spec.rate * (sim.boons.has('busy') ? 1.15 : 1)) };
}
export function upgradeCost(sim, st) { if (st.level >= 3) return Infinity; const base = TOWERS.find(t => t.id === st.kind).cost; const amount = Math.round(base * (st.level === 1 ? 0.6 : 1) / 5) * 5; return Math.round(amount * (sim.boons.has('thrifty') ? 0.75 : 1)); }
export function sellValue(st) { return Math.round(st.invested * 0.7); }
function progress(sim, pest) { if (pest.kind === 'wasp' || pest.kind === 'vespa') return Math.hypot(7.5 - pest.x, 4.5 - pest.y); return sim.flowField.get(key(Math.floor(pest.x), Math.floor(pest.y))) ?? Infinity; }
export function stepTowers(sim, dt) {
  for (const st of sim.stations) {
    const spec = TOWERS.find(t => t.id === st.kind); const stats = stationStats(sim, st); const x = st.c + 0.5; const y = st.r + 0.5;
    if (st.kind === 'wall') continue;
    if (st.kind === 'bell') {
      st.ringTimer -= dt; if (st.ringTimer <= 0) { st.ringTimer += spec.period; for (const p of pestsInRadius(sim, x, y, stats.range)) { damage(sim, p, stats.dmg, st.id); p.stunUntil = Math.max(p.stunUntil, sim.time + spec.stun); } sim.events.push({ type: 'ring', x, y }); } continue;
    }
    if (st.kind === 'sprinkler') {
      st.cooldown -= dt; if (st.cooldown <= 0) { st.cooldown += stats.period; for (const p of pestsInRadius(sim, x, y, stats.range)) { damage(sim, p, stats.dmg, st.id); p.slowFactor = Math.min(p.slowFactor, spec.slow * (sim.boons.has('dew') ? 0.75 : 1)); p.slowUntil = sim.time + spec.slowTime; } } continue;
    }
    st.cooldown -= dt; if (st.cooldown > 0) continue;
    const target = sim.pests.filter(p => p.hp > 0 && !p.reached && Math.hypot(p.x - x, p.y - y) <= stats.range).sort((a, b) => progress(sim, a) - progress(sim, b))[0];
    if (target) { st.cooldown += stats.period; sim.projectiles.push({ kind: st.kind === 'poppy' ? 'puff' : 'bee', x, y, target, lastX: target.x, lastY: target.y, dmg: stats.dmg, splash: st.kind === 'poppy' && sim.boons.has('splash'), speed: st.kind === 'poppy' ? 14 : 9, sourceTowerId: st.id }); }
  }
}
export function stepProjectiles(sim, dt) {
  for (const shot of sim.projectiles) {
    const target = shot.target;
    if (target && target.hp > 0 && !target.reached) { shot.lastX = target.x; shot.lastY = target.y; }
    const dx = shot.lastX - shot.x; const dy = shot.lastY - shot.y; const d = Math.hypot(dx, dy); const move = shot.speed * dt;
    if (d <= 0.18 || d <= move) {
      shot.x = shot.lastX; shot.y = shot.lastY;
      if (target?.hp > 0 && !target.reached) { damage(sim, target, shot.dmg, shot.sourceTowerId); if (shot.splash) for (const p of pestsInRadius(sim, target.x, target.y, 0.7)) if (p !== target) damage(sim, p, shot.dmg * 0.4, shot.sourceTowerId); }
      shot.dead = true;
    } else { shot.x += dx / d * move; shot.y += dy / d * move; }
  }
  sim.projectiles = sim.projectiles.filter(p => !p.dead);
}
