// Flow makeup: turn the WAVES table into a timed spawn list for one flow and difficulty, with hit points scaled by flow and difficulty.
import { DIFFICULTIES, PESTS, SPAWN_GAP, WAVES } from './config.js';

function difficultyOf(difficulty) {
  if (typeof difficulty === 'string') return DIFFICULTIES[difficulty.toLowerCase()] ?? DIFFICULTIES.keeper;
  return difficulty ?? DIFFICULTIES.keeper;
}
function groupsFor(flow) { return WAVES.find(wave => wave.flow === flow)?.groups ?? []; }
export function spawnList(flow, difficulty = 'keeper') {
  const scale = difficultyOf(difficulty).count;
  const list = [];
  let at = 0;
  for (const [pest, baseCount] of groupsFor(flow)) {
    const count = Math.max(1, Math.round(baseCount * scale));
    for (let i = 0; i < count; i += 1) {
      list.push({ at, pest });
      at += SPAWN_GAP;
    }
    at += 1.6 - SPAWN_GAP;
  }
  return list;
}
export function hpFor(pestId, flow, difficulty = 'keeper') {
  const pest = PESTS[pestId];
  if (!pest) return undefined;
  return pest.hp * difficultyOf(difficulty).hp * (1 + 0.12 * (flow - 1));
}
export function rosterFor(flow) {
  return groupsFor(flow).map(([pest, count]) => ({ pest, count }));
}
