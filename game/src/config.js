// Every tuning number in one place: cells, seconds, nectar, damage — and the NAMES table every screen reads.
export const STAGE = { w: 1280, h: 800 };
export const GRID = { cols: 15, rows: 8, cell: 62, x: 176, y: 128 };
export const HIVE_CELL = { c: 7, r: 4 };
export const GATES = { EAST: { c: 14, r: 3 }, NORTH: { c: 7, r: 0 }, WEST: { c: 0, r: 3 } };
export const ROCKS = [{ c: 4, r: 2 }, { c: 10, r: 5 }, { c: 5, r: 6 }];
export const TOWERS = [
  { id: 'poppy', name: 'POPPY TURRET', key: '1', cost: 30, range: 2.2, dmg: 10, rate: 3.5, unlockFlow: 1, line: 'Fast pollen puffs; steady single-target damage.', glyph: '✿', color: '#d85b73' },
  { id: 'sprinkler', name: 'CLOVER SPRINKLER', key: '2', cost: 40, range: 2, dmg: 2, rate: 2, unlockFlow: 1, line: 'Dew ticks slow pests 45% for 1.2 seconds.', glyph: '☘', color: '#65a94b', slow: 0.45, slowTime: 1.2 },
  { id: 'cannon', name: 'HIVE CANNON', key: '3', cost: 60, range: 3, dmg: 24, rate: 1, unlockFlow: 1, line: 'Homing bees deliver a heavy hit.', glyph: '●', color: '#d59a28' },
  { id: 'wall', name: 'WAX WALL', key: '4', cost: 25, range: 0, dmg: 0, rate: 0, unlockFlow: 1, line: 'Golden block with 220 HP; pests chew for 10 DPS.', glyph: '▰', color: '#e6b84c', hp: 220 },
  { id: 'bell', name: "QUEEN'S BELL", key: '5', cost: 80, range: 2.8, dmg: 18, rate: 0.25, period: 4, stun: 1.1, unlockFlow: 4, line: 'Rings every 5 seconds, damaging and stunning nearby pests.', glyph: '♢', color: '#f0d36d' },
];
export const PESTS = {
  ant: { name: 'ANT', hp: 18, speed: 1.15, reward: 2, score: 10, leak: 1, line: 'A steady ground crawler.' },
  mite: { name: 'MITE', hp: 8, speed: 1.9, reward: 1, score: 5, leak: 1, line: 'A quick pest that arrives in bursts.' },
  wasp: { name: 'WASP', hp: 30, speed: 0.85, reward: 4, score: 25, leak: 1, flying: true, line: 'Flying; ignores the meadow paths.' },
  hornborer: { name: 'HORNBORER', hp: 160, speed: 0.5, reward: 8, score: 60, leak: 2, armour: 4, line: 'Armoured; every hit loses 4 damage, minimum 1.' },
  vespa: { name: 'VESPA', hp: 2600, speed: 0.35, reward: 150, score: 1000, leak: 5, flying: true, line: 'The Hornet Queen: spawns a wasp every 6 seconds; enrages at half health.', spawn: 'wasp', spawnPeriod: 6, enrage: 0.5, enrageSpeed: 1.4 },
};
export const WAVES = [
  { flow: 1, groups: [['ant', 10]] },
  { flow: 2, groups: [['ant', 16], ['mite', 4]] },
  { flow: 3, groups: [['ant', 14], ['mite', 6], ['wasp', 2]], newPest: { id: 'wasp', note: 'Flying; ignores the paths.' } },
  { flow: 4, groups: [['ant', 20], ['mite', 8], ['wasp', 4]], unlock: 'bell' },
  { flow: 5, groups: [['ant', 16], ['mite', 10], ['wasp', 5], ['hornborer', 2]], newPest: { id: 'hornborer', note: 'Armoured; each hit loses 4 damage.' } },
  { flow: 6, groups: [['ant', 24], ['mite', 12], ['wasp', 6], ['hornborer', 3]] },
  { flow: 7, groups: [['ant', 28], ['mite', 14], ['wasp', 8], ['hornborer', 4]] },
  { flow: 8, groups: [['ant', 34], ['mite', 16], ['wasp', 10], ['hornborer', 6]] },
  { flow: 9, groups: [['ant', 20], ['mite', 10], ['wasp', 6], ['hornborer', 3], ['vespa', 1]] },
];
export const DIFFICULTIES = {
  gentle: { name: 'GENTLE', hp: 0.8, count: 0.85, nectar: 220, reward: 1.15 },
  keeper: { name: 'KEEPER', hp: 1, count: 1, nectar: 180, reward: 1 },
  stinging: { name: 'STINGING', hp: 1.25, count: 1.15, nectar: 150, reward: 0.9 },
};
export const BOONS = [
  { id: 'pollen', name: 'GOLDEN POLLEN', line: 'All damage +20%.', synergy: 'Every station hits harder.' },
  { id: 'wax', name: 'THICK WAX', line: 'Wax walls +150 HP.', synergy: 'Hold the narrow lanes.' },
  { id: 'busy', name: 'BUSY BEES', line: 'All stations attack 15% faster.', synergy: 'More hits from every station.' },
  { id: 'deep', name: 'DEEP NECTAR', line: '+60 nectar now; flow bonus +10.', synergy: 'Build now, earn more later.' },
  { id: 'charm', name: 'CHAIN CHARM', line: 'Chain window 4 s; max chain ×10.', synergy: 'Keep the BUZZ alive.' },
  { id: 'heart', name: 'AMBER HEART', line: 'Mend the hive +2 (max 10).', synergy: 'Restore the keeper’s reserve.' },
  { id: 'reach', name: 'LONG REACH', line: 'All ranges +0.4 cells.', synergy: 'Cover more ground.' },
  { id: 'dew', name: 'STICKY DEW', line: 'Slows are 25% stronger (45% → 56%).', synergy: 'Hold pests in the firing line.' },
  { id: 'jelly', name: 'ROYAL JELLY', line: 'All score +25%.', synergy: 'Every stopped pest counts more.' },
  { id: 'guard', name: 'HIVE GUARD', line: 'The hive stings adjacent pests for 5 dmg/s.', synergy: 'A last line of defense.' },
  { id: 'thrifty', name: 'THRIFTY KEEPER', line: 'Upgrades cost 25% less.', synergy: 'Improve more stations for less.' },
  { id: 'splash', name: 'POPPY SPLASH', line: 'Poppy hits splash 40% damage within 0.7 cells.', synergy: 'Poppy shots catch nearby pests.' },
];
export const FEATS = [
  { id: 'hold', name: 'HOLD THE MEADOW', line: 'Win a run.' },
  { id: 'vespa', name: 'VESPA DOWN', line: 'Stop Vespa.' },
  { id: 'untouched', name: 'UNTOUCHED', line: 'Win with the hive at 10.' },
  { id: 'buzz', name: 'BUZZ ×8', line: 'Reach a ×8 chain.' },
  { id: 'bloom', name: 'FULL BLOOM', line: 'Own 8 stations at once.' },
  { id: 'rich', name: 'RICH KEEPER', line: 'Hold 250 nectar at once.' },
];
export const GRADES = [{ grade: 'S', min: 9000 }, { grade: 'A', min: 7000 }, { grade: 'B', min: 5000 }, { grade: 'C', min: 3000 }, { grade: 'D', min: 0 }];
export const NAMES = { hive: 'THE GREAT HIVE', currency: 'NECTAR', chain: 'BUZZ', win: 'WIN: HOLD 9 FLOWS', lose: 'LOSE: HIVE DRAINED', endless: 'SWARM SEASON', keeper: 'MIRA' };
export const HIVE_MAX = 10;
export const CHAIN_WINDOW = 2.5;
export const CHAIN_MAX = 8;
export const SPAWN_GAP = 0.55;
export const SWARM_DMG = 25;
export const REROLL_COST = 15;
export const DRAFT_AFTER = [2, 4, 6, 8];
export const SELL_RATE = 0.7;
