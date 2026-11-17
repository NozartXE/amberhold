// The between-flow draft: offer three different boons (weighted by what the run still lacks, owned ones removed), with one paid reroll.
import { BOONS, HIVE_MAX } from './config.js';
import { makeRng } from './rng.js';
export function offersFor(seed, draftIndex, owned) {
  const rng = makeRng(seed * 1000 + draftIndex * 131 + 77); const pool = BOONS.filter(b => !owned.includes(b.id)).map(b => b.id); const out = [];
  while (out.length < 3 && pool.length) out.push(pool.splice(rng.int(pool.length), 1)[0]);
  return out;
}
export function applyBoon(sim, id) {
  if (sim.boons.has(id)) return false;
  sim.boons.add(id); sim.boonsPicked.push(id);
  switch (id) {
    case 'deep': sim.nectar += 60; sim.checkRich(); break;
    case 'heart': sim.hive = Math.min(HIVE_MAX, sim.hive + 2); break;
    case 'wax': for (const st of sim.stations) if (st.kind === 'wall') st.hp += 150; break;
  }
  return true;
}
