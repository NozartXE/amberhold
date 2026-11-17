// Headless balance: the rehearsal plan plays whole campaigns in Node — the campaign must be winnable, an idle keeper must lose, and the cover tick is picked by density.
import { createSim } from '../game/src/sim.js';
import { applyPlan, botDraft } from '../game/src/plan.js';
import { damage } from '../game/src/combat.js';

function runCampaign(seed, difficulty, mode = 'plan') {
  const sim = createSim({ seed, difficulty });
  const density = [];
  let built = new Set(); let swarmFlows = new Set();
  for (let ticks = 0; ticks < 200000 && !['won', 'lost'].includes(sim.screen); ticks += 1) {
    if (sim.screen === 'draft') botDraft(sim);
    if (sim.screen === 'build') {
      const allowed = mode === 'plan' || (mode === 'weak' && sim.flow <= 3) || (mode === 'idle' && sim.flow === 1);
      if (allowed && !built.has(sim.flow)) {
        for (const a of applyPlan(sim, sim.flow)) console.log(`REFUSED seed ${seed} ${difficulty} flow ${sim.flow}: ${JSON.stringify(a)}`);
        built.add(sim.flow);
      }
      sim.startFlow();
    }
    if (sim.screen === 'flow' && !swarmFlows.has(sim.flow) && sim.pests.filter(p => p.hp > 0 && !p.reached).length >= 10) {
      for (const p of [...sim.pests]) if (p.hp > 0 && !p.reached) damage(sim, p, 25, 'swarm');
      sim.swarmReady = false; swarmFlows.add(sim.flow);
    }
    sim.step(1 / 60);
    if (sim.screen === 'flow' && sim.flow >= 4 && sim.flow <= 6) density.push({ flow: sim.flow, tickInFlow: Math.round(sim.flowTime * 60), value: sim.pests.filter(p => p.hp > 0 && !p.reached).length + sim.projectiles.length + sim.floaters.length * 2 });
  }
  return { screen: sim.screen, score: sim.score, flow: sim.flow, hive: sim.hive, kills: sim.kills, hash: sim.finalHash(), density };
}

const cases = [];
const keeper7 = runCampaign(7, 'keeper');
cases.push(['keeper seed 7 wins with hive >= 3', keeper7.screen === 'won' && keeper7.hive >= 3]);
const keeperWins = Array.from({ length: 8 }, (_, i) => runCampaign(i + 1, 'keeper')).filter(r => r.screen === 'won').length;
cases.push([`keeper wins >= 6/8 (got ${keeperWins})`, keeperWins >= 6]);
const weak = runCampaign(11, 'keeper', 'weak');
cases.push([`weak seed 11 loses (got ${weak.screen})`, weak.screen === 'lost']);
const idle = runCampaign(12, 'keeper', 'idle');
cases.push([`idle seed 12 loses by flow 6 (got ${idle.screen} flow ${idle.flow})`, idle.screen === 'lost' && idle.flow <= 6]);
cases.push(['determinism seed 7 finalHash', keeper7.hash === runCampaign(7, 'keeper').hash]);
const gentleWins = Array.from({ length: 8 }, (_, i) => runCampaign(i + 1, 'gentle')).filter(r => r.screen === 'won').length;
cases.push([`gentle wins >= 5/8 (got ${gentleWins})`, gentleWins >= 5]);
const stingingWins = Array.from({ length: 8 }, (_, i) => runCampaign(i + 1, 'stinging')).filter(r => r.screen === 'won').length;
cases.push([`stinging wins >= 2/8 (got ${stingingWins})`, stingingWins >= 2]);
for (const [label, pass] of cases) console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`);
const peak = keeper7.density.reduce((best, sample) => sample.value > best.value ? sample : best, { flow: 4, tickInFlow: 0, value: -1 });
console.log(`PLAN_COVER suggestion: { flow: ${peak.flow}, tickInFlow: ${peak.tickInFlow} } (density ${peak.value})`);
if (cases.some(([, pass]) => !pass)) process.exitCode = 1;
