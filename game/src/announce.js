// The meadow's voice: notable sim events become the three-line event log and the big centre banner (a new pest, the gate moving, the swarm spent).
import { PESTS } from './config.js';
import { gateName } from './gate.js';
export function createAnnounce() {
  const announce = { log: [], banner: null, push(sim, text, opts = {}) { const row = { text, at: sim.time }; this.log.unshift(row); this.log.length = Math.min(3, this.log.length); if (opts.banner !== false) this.banner = { text, sub: opts.sub ?? '', until: sim.time + 3.2 }; }, update(sim) { if (this.banner && sim.time >= this.banner.until) this.banner = null; } };
  return announce;
}
export function eventText(sim, ev) {
  if (ev.type === 'gate') return `THE GATE MOVES ${gateName(ev.side)}`;
  if (ev.type === 'newpest') { const spec = PESTS[ev.id]; const wave = sim.waves.find(w => w.newPest?.id === ev.id); return `NEW: ${spec.name} — ${wave?.newPest.note ?? spec.line}`; }
  if (ev.type === 'ring') return null;
  if (ev.type === 'leak') return 'THE HIVE IS DRAINING';
  if (ev.type === 'swarm') return 'THE SWARM IS LOOSED';
  if (ev.type === 'vespa') return 'VESPA, THE HORNET QUEEN';
  if (ev.type === 'enrage') return 'VESPA RAGES';
  return null;
}
