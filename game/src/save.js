// Persistence in localStorage: best score per difficulty, the last three runs the results screen reads back, feats and the Swarm Season unlock.
const KEY = 'amberhold-save-v1';
function fresh() { return { best: {}, history: [], feats: {}, wins: 0 }; }
export function loadSave() {
  if (typeof localStorage === 'undefined') return fresh();
  try { const parsed = JSON.parse(localStorage.getItem(KEY)); return { ...fresh(), ...(parsed ?? {}), best: parsed?.best ?? {}, history: parsed?.history ?? [], feats: parsed?.feats ?? {} }; } catch { return fresh(); }
}
export function storeSave(save) { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(save)); return save; }
export function recordRun(save, run) {
  save.history.unshift(run); save.history.length = Math.min(3, save.history.length);
  if (run.won) save.wins += 1;
  save.best[run.difficulty] = Math.max(save.best[run.difficulty] ?? 0, run.score);
  return storeSave(save);
}
