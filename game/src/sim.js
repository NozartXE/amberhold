// The run state and its fixed-step update: build, flow, draft and results are one state machine, and input only ever queues intents.
import { DRAFT_AFTER, DIFFICULTIES, HIVE_MAX, REROLL_COST, TOWERS, WAVES } from './config.js';
import { makeRng, hashState } from './rng.js';
import { createGrid, canPlace, place, removeAt, key } from './grid.js';
import { flowField, wouldSeal } from './pathing.js';
import { gateForFlow, gateCell } from './gate.js';
import { spawnList } from './waves.js';
import { spawnPest, stepPests, pestsInRadius } from './enemies.js';
import { makeStation, stepTowers, stepProjectiles, upgradeCost, sellValue } from './towers.js';
import { damage } from './combat.js';
import { offersFor, applyBoon } from './draft.js';
import { createAnnounce, eventText } from './announce.js';
import { checkFeat } from './feats.js';
import { recordRun } from './save.js';
export function createSim({ seed, difficulty = 'keeper', save = { best: {}, history: [], feats: {}, wins: 0 } }) {
  const keyDiff = String(difficulty).toLowerCase(); const difficultyData = DIFFICULTIES[keyDiff] ?? DIFFICULTIES.keeper;
  const sim = { seed, difficulty: keyDiff, difficultyData, save, rng: makeRng(seed), time: 0, tick: 0, screen: 'build', flow: 1, grid: createGrid(), stations: [], pests: [], projectiles: [], floaters: [], events: [], nectar: difficultyData.nectar, hive: HIVE_MAX, score: 0, chain: 0, chainUntil: 0, lastKillAt: -Infinity, kills: 0, leaks: 0, leaksPerFlow: Array(9).fill(0), nectarEarned: 0, bestChain: 0, swarmReady: false, boons: new Set(), boonsPicked: [], offersSeen: 0, draft: null, draftIndex: 0, spawns: [], spawnPointer: 0, flowTime: 0, newFeats: [], vespaDown: false, endless: false, announce: createAnnounce(), nextPestId: 1, nextStationId: 1, gateCell: gateCell(gateForFlow(seed, 1)), waves: [], flowsHeld: 0, flowField: new Map(),
    persist() { recordRun; if (typeof localStorage !== 'undefined') { try { localStorage.setItem('amberhold-save-v1', JSON.stringify(this.save)); } catch {} } },
    feat(id) { return checkFeat(this, id); },
    checkRich() { if (this.nectar >= 250) this.feat('rich'); },
    queueSpawn(id, at) { this.pendingSpawns ??= []; this.pendingSpawns.push({ id, at }); },
    leak(pest) { const n = pest.leak ?? 1; this.hive -= n; this.leaks += n; this.leaksPerFlow[this.flow - 1] = (this.leaksPerFlow[this.flow - 1] ?? 0) + n; this.floaters.push({ x: 7.5, y: 4.5, text: `−${n} HIVE`, t: 0, color: 'red' }); this.events.push({ type: 'leak' }); if (this.hive <= 0) this.finish(false); },
    finalHash() { return hashState({ score: this.score, nectar: this.nectar, hive: this.hive, kills: this.kills, flow: this.flow, stations: this.stations.map(s => [s.kind, s.c, s.r, s.level, s.hp]), rng: this.rng.state.value }); },
    startFlow() { this.screen = 'flow'; this.flowTime = 0; this.gateSide = gateForFlow(this.seed, this.flow); this.gateCell = gateCell(this.gateSide); this.spawns = spawnList(this.flow, keyDiff); if (this.endless && this.flow > 9) { const factor = 1 + 0.15 * (this.flow - 9); const base = spawnList(8, keyDiff); this.spawns = base.map(s => ({ ...s, at: s.at / factor })); } if (this.flow === 9 && !this.endless) this.spawns.push({ at: (this.spawns.at(-1)?.at ?? 0) + 1, pest: 'vespa' }); this.spawnPointer = 0; this.swarmReady = true; this.waves = (awaitlessWaves); this.events.push({ type: 'gate', side: this.gateSide }); if (this.flow === 3) this.events.push({ type: 'newpest', id: 'wasp' }); if (this.flow === 5) this.events.push({ type: 'newpest', id: 'hornborer' }); if (this.flow === 9) this.events.push({ type: 'vespa' }); },
    buy(towerId, c, r) { const spec = TOWERS.find(t => t.id === towerId); if (!spec || !canPlace(this.grid, c, r) || this.nectar < spec.cost || (towerId === 'bell' && this.flow < 4 && !this.endless) || (towerId === 'wall' && wouldSeal(this.grid, c, r))) return false; const st = makeStation(this, towerId, c, r); if (!place(this.grid, c, r, st)) return false; this.stations.push(st); const paid = Math.ceil(spec.cost * (this.boons.has('thrifty') ? 0.75 : 1)); st.invested = paid; this.nectar -= paid; if (this.stations.length >= 8) this.feat('bloom'); this.checkRich(); return true; },
    upgradeAt(c, r) { const st = this.grid.occ.get(key(c, r)); if (!st) return false; const cost = upgradeCost(this, st); if (this.nectar < cost || !Number.isFinite(cost)) return false; this.nectar -= cost; st.invested += cost; st.level += 1; if (st.kind === 'wall') st.hp *= st.level === 2 ? 1.8 : 3 / 1.8; return true; },
    sellAt(c, r) { const st = removeAt(this.grid, c, r); if (!st) return false; this.stations = this.stations.filter(s => s !== st); this.nectar += sellValue(st); this.checkRich(); return true; },
    upgradeSelected(c, r) { return this.upgradeAt(c, r); },
    pickBoon(i) { if (this.screen !== 'draft' || !this.draft?.offers[i]) return false; applyBoon(this, this.draft.offers[i]); this.draftIndex += 1; this.draft = null; this.flow += 1; this.screen = 'build'; return true; },
    reroll() { if (this.screen !== 'draft' || this.draft.rerolled || this.nectar < REROLL_COST) return false; this.nectar -= REROLL_COST; this.draft.offers = offersFor(seed, this.draftIndex + 1, [...this.boons]); this.draft.rerolled = true; this.offersSeen += 3; return true; },
    enterEndless() { if (this.screen !== 'won') return false; this.endless = true; this.flow = 10; this.screen = 'build'; return true; },
    step(dt = 1 / 60) { this.tick += 1; this.time += dt; this.announce.update(this); if (this.screen === 'flow') { this.flowTime += dt; while (this.spawnPointer < this.spawns.length && this.spawns[this.spawnPointer].at <= this.flowTime) { const item = this.spawns[this.spawnPointer++]; this.pests.push(spawnPest(this, item.pest, this.gateCell)); } for (const q of this.pendingSpawns ?? []) this.pests.push(spawnPest(this, q.id, q.at)); this.pendingSpawns = []; this.flowField = flowField(this.grid); stepPests(this, dt); stepTowers(this, dt); stepProjectiles(this, dt); if (this.boons.has('guard')) for (const p of pestsInRadius(this, 7.5, 4.5, 0.8)) damage(this, p, 5 * dt, 'hiveguard'); this.age(dt); if (this.time >= this.chainUntil) this.chain = 0; if (this.screen === 'flow' && this.spawnPointer >= this.spawns.length && this.pests.every(p => p.hp <= 0 || p.reached) && !this.pendingSpawns?.length) this.flowClear(); } else this.age(dt); for (const ev of this.events.splice(0)) { const text = eventText(this, ev); if (text) this.announce.push(this, text); } },
    age(dt) { for (const f of this.floaters) f.t += dt; this.floaters = this.floaters.filter(f => f.t < 1.1); },
    flowClear() { this.flowsHeld = Math.max(this.flowsHeld, this.flow); this.nectar += 20 + 2 * this.flow + (this.boons.has('deep') ? 10 : 0); this.checkRich(); if (this.flow === 9 && !this.endless) this.finish(true); else if (!this.endless && DRAFT_AFTER.includes(this.flow)) { const side = gateForFlow(this.seed, this.flow + 1); this.draft = { offers: offersFor(seed, this.draftIndex, [...this.boons]), rerolled: false, side }; this.offersSeen += 3; this.screen = 'draft'; } else { this.flow += 1; this.screen = 'build'; } },
    finish(won) { this.screen = won ? 'won' : 'lost'; if (won) { this.feat('hold'); if (this.hive === HIVE_MAX) this.feat('untouched'); } const flows = won ? 9 : this.flowsHeld; const grade = this.score >= 9000 ? 'S' : this.score >= 7000 ? 'A' : this.score >= 5000 ? 'B' : this.score >= 3000 ? 'C' : 'D'; recordRun(this.save, { score: this.score, flows, won, difficulty: keyDiff, seed, grade }); },
  };
  return sim;
}
const awaitlessWaves = WAVES;
