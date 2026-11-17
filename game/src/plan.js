// The keeper's rehearsal plan: a fixed build order and draft picks that the staging bot follows, so a whole campaign can be replayed tick-perfect in Node and in the browser.
export const PLAN_COVER = { flow: 6, tickInFlow: 123 };
export const PLAN = [
  [
    { buy: 'poppy', c: 6, r: 1 }, { buy: 'poppy', c: 8, r: 1 },
    { buy: 'sprinkler', c: 5, r: 1 },
  ],
  [ { buy: 'cannon', c: 10, r: 3 }, { buy: 'poppy', c: 4, r: 4 } ],
  [ { buy: 'poppy', c: 7, r: 2 }, { buy: 'sprinkler', c: 9, r: 4 } ],
  [ { buy: 'bell', c: 6, r: 3 }, { upgrade: true, c: 8, r: 1 } ],
  [ { buy: 'cannon', c: 4, r: 4 }, { upgrade: true, c: 5, r: 3 } ],
  [ { buy: 'bell', c: 8, r: 5 }, { upgrade: true, c: 10, r: 3 } ],
  [ { buy: 'cannon', c: 7, r: 1 }, { upgrade: true, c: 6, r: 3 } ],
  [ { buy: 'poppy', c: 3, r: 3 }, { upgrade: true, c: 4, r: 4 } ],
  [ { upgrade: true, c: 7, r: 1 }, { upgrade: true, c: 9, r: 3 } ],
];
export const DRAFT_PICKS = [2, 1, 2, 0];

export function applyPlan(sim, flow) {
  const refused = [];
  for (const action of PLAN[flow - 1] ?? []) {
    const landed = action.buy ? sim.buy(action.buy, action.c, action.r)
      : action.upgrade ? sim.upgradeAt(action.c, action.r)
        : action.sell ? sim.sellAt(action.c, action.r) : false;
    if (!landed) refused.push(action);
  }
  return refused;
}

export function botDraft(sim) {
  if (sim.screen !== 'draft') return false;
  const offers = sim.draft?.offers ?? [];
  const requested = DRAFT_PICKS[sim.draftIndex] ?? 0;
  return sim.pickBoon(Math.min(requested, Math.max(0, offers.length - 1)));
}
