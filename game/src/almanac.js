// The Field Guide's contents, read from config every time (never typed twice): each pest's numbers and trait, each station's cost and job, each boon's promise.
import { BOONS, PESTS, TOWERS } from './config.js';
export function guideRows() {
  return { pests: Object.entries(PESTS).map(([id, p]) => ({ id, name: p.name, hp: p.hp, speed: p.speed, reward: p.reward, score: p.score, leak: p.leak, trait: p.line })), stations: TOWERS.map(t => ({ id: t.id, name: t.name, cost: t.cost, range: t.range, damage: t.dmg, rate: t.rate, job: t.line })), boons: BOONS.map(b => ({ id: b.id, name: b.name, effect: b.line })) };
}
