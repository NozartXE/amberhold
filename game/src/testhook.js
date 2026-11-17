// The staging hook (only with ?test=1 or ?shot= in the URL): scripted runs for the balance tool, the playtest and the screenshot stageplan — never loaded in normal play.
import { applyPlan, botDraft, PLAN_COVER } from './plan.js';
import { damage } from './combat.js';

export function initTestHook(api) {
  let built = new Set(); let swarmFlows = new Set();
  function startRun(seed, difficulty = 'keeper') { built = new Set(); swarmFlows = new Set(); api.startRun(seed, difficulty); return api.getSim(); }
  function botStep() {
    const sim = api.getSim(); if (!sim) return;
    if (sim.screen === 'draft') botDraft(sim);
    if (sim.screen === 'build') { if (!built.has(sim.flow)) { applyPlan(sim, sim.flow); built.add(sim.flow); } sim.startFlow(); }
    if (sim.screen === 'flow' && sim.pests.filter(p => p.hp > 0 && !p.reached).length >= 10 && sim.swarmReady && !swarmFlows.has(sim.flow)) {
      for (const p of [...sim.pests]) if (p.hp > 0 && !p.reached) damage(sim, p, 25, 'swarm');
      sim.swarmReady = false; swarmFlows.add(sim.flow);
    }
  }
  function snapshot() {
    const sim = api.getSim(); if (!sim) return null;
    return { screen: sim.screen, flow: sim.flow, tick: sim.tick, score: sim.score, nectar: sim.nectar, hive: sim.hive, pests: sim.pests.length, stations: sim.stations.length, hash: sim.finalHash() };
  }
  function botTo(flow, maxTicks = 100000, tickInFlow = null) {
    const sim = api.getSim(); let spent = 0;
    while (spent < maxTicks && !['won', 'lost'].includes(sim.screen)) {
      if (sim.flow === flow && (sim.screen === 'build' || sim.screen === 'flow') && (tickInFlow == null || sim.screen === 'flow' && Math.floor(sim.flowTime * 60) >= tickInFlow)) break;
      botStep(); sim.step(1 / 60); spent += 1;
    }
    return snapshot();
  }
  function playRun(kind) {
    const seed = kind === 'weak' ? 11 : kind === 'idle' ? 12 : 7;
    startRun(seed, 'keeper'); const sim = api.getSim(); let spent = 0;
    while (spent++ < 200000 && !['won', 'lost'].includes(sim.screen)) {
      if (sim.screen === 'draft') botDraft(sim);
      if (sim.screen === 'build') {
        const limit = kind === 'win' ? 9 : kind === 'weak' ? 3 : 1;
        if (sim.flow <= limit && !built.has(sim.flow)) { applyPlan(sim, sim.flow); built.add(sim.flow); }
        sim.startFlow();
      }
      if (sim.screen === 'flow' && sim.swarmReady && !swarmFlows.has(sim.flow) && sim.pests.filter(p => p.hp > 0 && !p.reached).length >= 10) {
        for (const p of [...sim.pests]) if (p.hp > 0 && !p.reached) damage(sim, p, 25, 'swarm');
        sim.swarmReady = false; swarmFlows.add(sim.flow);
      }
      sim.step(1 / 60);
    }
    return { screen: sim.screen, score: sim.score, flow: sim.flow, hive: sim.hive, kills: sim.kills, hash: sim.finalHash() };
  }
  const hook = { startRun, getSim: api.getSim, setPaused: api.setPaused, botTo, runBotTo: botTo, playRun, playScriptedRun: playRun, snapshot, stage(shot) {
    window.__SHOT_READY = '';
    if (shot === 'title') { api.setPaused(false); const began = performance.now(); const ready = () => { if (performance.now() - began >= 2000) window.__SHOT_READY = 'title'; else requestAnimationFrame(ready); }; requestAnimationFrame(ready); return; }
    if (shot === 'play') { startRun(7, 'keeper'); botTo(PLAN_COVER.flow, 100000, PLAN_COVER.tickInFlow); api.setPaused(true); window.__SHOT_READY = 'play'; return; }
    if (shot === 'draft') { startRun(7, 'keeper'); const sim = api.getSim(); while (sim.screen !== 'draft' && !['won', 'lost'].includes(sim.screen)) { botStep(); sim.step(1 / 60); } window.__SHOT_READY = 'draft'; return; }
    if (shot === 'results') { const save = api.getSim()?.save; for (const kind of ['weak', 'idle']) { const result = playRun(kind); hook.results ??= []; hook.results.push(result); } startRun(7, 'keeper'); const sim = api.getSim(); let spent = 0; while (spent++ < 200000 && !['won', 'lost'].includes(sim.screen)) { if (sim.screen === 'draft') botDraft(sim); if (sim.screen === 'build') { if (!built.has(sim.flow)) { applyPlan(sim, sim.flow); built.add(sim.flow); } sim.startFlow(); } sim.step(1 / 60); } window.__SHOT_READY = 'results'; return hook.results; }
  } };
  window.__amberhold = hook;
  return hook;
}
