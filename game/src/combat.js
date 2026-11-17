// Damage, death and the BUZZ chain: armour shaves every hit, kills pay nectar and score, and quick kills raise the chain that multiplies both the score and the floaters.
import { CHAIN_MAX, CHAIN_WINDOW, PESTS, SWARM_DMG } from './config.js';
export function damage(sim, pest, amount, source) {
  if (!pest || pest.hp <= 0 || pest.reached) return 0;
  const dealt = Math.max(1, amount - (PESTS[pest.kind].armour && source !== 'hiveguard' && source !== 'swarm' ? PESTS[pest.kind].armour : 0));
  pest.hp -= dealt;
  if (pest.hp <= 0) kill(sim, pest);
  return dealt;
}
export function kill(sim, pest) {
  if (pest._killed) return;
  pest._killed = true; pest.hp = 0;
  const charm = sim.boons.has('charm');
  sim.chain = sim.time - sim.lastKillAt <= (charm ? 4 : CHAIN_WINDOW) ? Math.min(sim.chain + 1, charm ? 10 : CHAIN_MAX) : 1;
  sim.lastKillAt = sim.time; sim.chainUntil = sim.time + (charm ? 4 : CHAIN_WINDOW); sim.bestChain = Math.max(sim.bestChain, sim.chain);
  const spec = PESTS[pest.kind]; const gained = Math.round(spec.score * sim.chain * (sim.boons.has('jelly') ? 1.25 : 1));
  sim.score += gained; sim.nectarEarned += Math.round(spec.reward * sim.difficultyData.reward); sim.nectar += Math.round(spec.reward * sim.difficultyData.reward); sim.kills += 1;
  if (sim.chain >= 2 || gained >= 50) sim.floaters.push({ x: pest.x, y: pest.y, text: `+${gained} BUZZ x${sim.chain}`, t: 0 });
  if (sim.chain >= 8) sim.feat('buzz');
  if (pest.kind === 'vespa') { sim.vespaDown = true; sim.feat('vespa'); }
  sim.checkRich();
}
export function releaseSwarm(sim) {
  if (!sim.swarmReady || sim.screen !== 'flow') return false;
  for (const pest of [...sim.pests]) if (pest.hp > 0 && !pest.reached) damage(sim, pest, SWARM_DMG, 'swarm');
  sim.swarmReady = false; sim.events.push({ type: 'swarm' }); return true;
}
