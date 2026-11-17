// The six feats: checked against the run and the save the moment they happen, so the title can boast FEATS n/6 and the results can light the new ones.
import { FEATS } from './config.js';
export function checkFeat(sim, id) {
  if (!FEATS.some(f => f.id === id) || sim.save.feats[id]) return false;
  sim.save.feats[id] = true; sim.newFeats.push(id); sim.persist(); return true;
}
export function featCount(save) { return Object.values(save?.feats ?? {}).filter(Boolean).length; }
